import { Worker } from "bullmq";
import { converToHLS } from "../hlsTranscoding/convertToHLS";
import prisma from "../prisma/client";
import { generateMasterPlaylist } from "../hlsTranscoding/generateMasterPlaylist";
import { redisClient } from "../lib/redis";
import { getOriginalResolution, getValidResolutionVariants } from "../hlsTranscoding/hlsUlits";
import { getAllResolutionStatus, setResolutionStatus } from "../lib/transcodeTracker";
import { videoQueue } from "./videoQueue";
import { JobState } from 'bullmq';
import { uploadFolderToS3 } from "../lib/s3/uploadFolderToS3";
import { cleanupLocalFile } from "../utils/cleanupLocalFile";

export const videoQueueWorker = new Worker("videoQueue", async job => {
    console.log("inside videoQueueWorker");

    const { fileId, folderName, hlsOutputPath, inputPath } = job.data;

    // Find the original resolution of the video
    const originalResloution = getOriginalResolution(inputPath);

    const validVariants = getValidResolutionVariants(originalResloution, inputPath);

    const progressMap = await getAllResolutionStatus(fileId);

    for (const res of validVariants) {

        const status = progressMap[res.height];
        if (status == "done") {
            console.log(`Skipping ${res.height}p , already done`);
            continue;
        }

        await setResolutionStatus(fileId, res.height, "processing");


        try {
            await converToHLS(inputPath, hlsOutputPath, res.height);
            console.log(`Done: ${res.height}p`);
            await setResolutionStatus(fileId, res.height, "done");
        } catch (err) {
            console.error(`Failed ${res.height}p:`, err);
            await setResolutionStatus(fileId, res.height, "failed");
        }

    }

    //generate the master playlist
    try {
        generateMasterPlaylist(hlsOutputPath, validVariants);
    } catch (err) {
        console.error("Failed to generate master playlist", err);
    }


    // Final url for all-resolution stream
    let streamUrl = `/hls/${folderName}/master.m3u8`;

    try {
        await prisma.file.update({
            where: { id: fileId },
            data: {
                transcodingStatus: true,
                streamUrl: streamUrl,
            },
        });
    } catch (err) {
        console.log(err);
    }

    try{
        await uploadFolderToS3(hlsOutputPath, `stream/${folderName}`);

        cleanupLocalFile(inputPath)
        cleanupLocalFile(hlsOutputPath)
    }catch(err) {
        console.error(`Failed video uploding for s3 or local cleanig`, err);
    }

    await redisClient.del(`video-status:${fileId}`);


}, {
    connection: redisClient,
    lockDuration: 15000,
    lockRenewTime: 10000,
    stalledInterval: 5000,
    maxStalledCount: 2,
    limiter: {
        max: 1,
        duration: 1000
    },
});

// Function to recover the stalled/stucked jobs after restart
export async function initializeJobRecovery() {

    const RECOVERY_STATES: JobState[] = [
        'active',
        'completed',
        'delayed',
        'failed',
        'paused',
        'stalled',
        'waiting'
    ].filter(s => ['active', 'stalled', 'failed', 'waiting'].includes(s)) as JobState[];

    try {
        const jobs = await videoQueue.getJobs(RECOVERY_STATES);

        for (const job of jobs) {
            try {
                // Type guard for job data
                if (!job?.id || !(job.data as any)?.fileId) continue;

                // Get progress with proper typing
                let progress: { timestamp?: number } = {};
                try {
                    progress = (await job.getProgress() as { timestamp?: number }) || {};
                } catch {
                    const redisProgress = await redisClient.hgetall(`job:${job.id}:progress`);
                    progress.timestamp = redisProgress.timestamp ? parseInt(redisProgress.timestamp) : undefined;
                }

                // Check job age
                const timestamp = progress.timestamp || job.timestamp || Date.now();
                if (Date.now() - timestamp > 3600000) {
                    await job.moveToFailed(new Error('Job expired'));
                    continue;
                }

                // Check resolution status
                const resolutionStatus = await getAllResolutionStatus((job.data as any).fileId);
                if (Object.values(resolutionStatus).every(s => s === 'done')) {
                    await job.moveToCompleted('already completed', null, true);
                    continue;
                }

                // Retry job
                await job.retry();
                console.log(`Recovered job ${job.id}`);
            } catch (err) {
                console.error(`Recovery failed for job ${job?.id || 'unknown'}:`, err);
                try {
                    await job.moveToFailed(err as Error);
                } catch (moveErr) {
                    console.error(`Failed to mark job as failed:`, moveErr);
                }
            }
        }
    } catch (err) {
        console.error('Job recovery initialization failed:', err);
    }
}

// Execute when server restarts
(async () => {
    try {

        console.log(`Redis connection status: ${redisClient.status}`);

        if (redisClient.status === 'ready') {
            console.log('Redis - Already connected');
        } else if (redisClient.status === 'connecting') {
            await new Promise(resolve => redisClient.once('ready', resolve));
            console.log('Redis - Connection established');
        } else {
            await redisClient.connect();
            console.log('Redis - Connection established');
        }

        await initializeJobRecovery();

    } catch (err) {
        console.error('Job recovery failed:', err);
    }
})();