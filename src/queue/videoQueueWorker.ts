import { Worker } from "bullmq";
import { converToHLS } from "../utils/convertToHLS";
import prisma from "../prisma/client";
import { generateMasterPlaylist } from "../utils/generateMasterPlaylist";
import { redisClient } from "../lib/redis";

export const videoQueueWorker = new Worker("videoQueue", async job => {
    console.log("inside videoQueueWorker");

    const { fileId, folderName, hlsOutputPath, inputPath, resolutions } = job.data;
    let streamUrl = `/hls/${folderName}/output_720p.m3u8`;

    for (const res of resolutions){

        await converToHLS(inputPath, hlsOutputPath, res);

        if( res == "720"){

            try{
                await prisma.file.update({
                    where: { id: fileId },
                    data: {
                        isTranscoded720: true,
                        streamUrl: streamUrl,
                    }
                } );
            } catch(err) {
                console.log(err);
            }
        }
        console.log("transcoding ${res} done")

    }
    
    generateMasterPlaylist(hlsOutputPath, resolutions);

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

}, {
    connection: redisClient
});