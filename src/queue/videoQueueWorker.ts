import { Worker } from "bullmq";
import { converToHLS } from "../hlsTranscoding/convertToHLS";
import prisma from "../prisma/client";
import { generateMasterPlaylist } from "../hlsTranscoding/generateMasterPlaylist";
import { redisClient } from "../lib/redis";
import { getOriginalResolution, getValidResolutionVariants } from "../hlsTranscoding/hlsUlits";
import { getAllResolutionStatus, setResolutionStatus } from "../lib/transcodeTracker";

export const videoQueueWorker = new Worker("videoQueue", async job => {
    console.log("inside videoQueueWorker");

    const { fileId, folderName, hlsOutputPath, inputPath } = job.data;
    let streamUrl = `/hls/${folderName}/output_720p.m3u8`;

    // Find the original resolution of the video
    const originalResloution = getOriginalResolution(inputPath);
    const validVariants = getValidResolutionVariants(originalResloution, inputPath);

    const progressMap = await getAllResolutionStatus(fileId);

    for (const res of validVariants){

        const status = progressMap[res.height];

        if(status == "done"){
            console.log(`Skipping ${res.height}p , already done`);
            continue;
        }

        await setResolutionStatus(fileId,res.height,"processing");

        await converToHLS(inputPath, hlsOutputPath, res.height);

        await setResolutionStatus(fileId,res.height,"done");
    }

    //generate the master playlist
    generateMasterPlaylist(hlsOutputPath, validVariants);

    // Final url for all-resolution stream
    streamUrl = `/hls/${folderName}/master.m3u8`;
    
    try{
        await prisma.file.update({
            where: { id: fileId },
            data: {
                isFullyTranscoded: true,
                streamUrl: streamUrl,
            }, 
        });
    } catch(err) {
        console.log(err);
    }

    await redisClient.del(`video-status:${fileId}`);


}, {
    connection: redisClient,
    lockDuration: 7000,
    lockRenewTime: 3000,
    stalledInterval: 3000,
    maxStalledCount: 1,
    limiter: {
        max: 1,
        duration: 1000
    }
}); 