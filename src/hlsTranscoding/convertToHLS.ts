import fs from "fs"
import path from "path"
import ffmpeg from "fluent-ffmpeg";

export const converToHLS = (
    inputPath: string, 
    hlsOutputPath: string, 
    resolution: number
): Promise<void> => {
    return new Promise((resolve, reject) => {

        if(!fs.existsSync(hlsOutputPath)){
            fs.mkdirSync(hlsOutputPath, {recursive: true});
        }

        const diffResFolder = path.join(hlsOutputPath, resolution.toString());

        if(!fs.existsSync(diffResFolder)){
            fs.mkdirSync(diffResFolder, {recursive: true});
        }

        const outputFile = path.join(diffResFolder, `output_${resolution}p.m3u8`);
        const segmentPattern = path.join(diffResFolder,`segment_${resolution}_%03d.ts`); 

        
        // IMP (actual hls chunks creation for the vedio)
        ffmpeg(inputPath)
            .addOptions([
                `-vf scale=-2:${resolution}`,
                "-preset veryfast",
                "-g 48",
                "-sc_threshold 0",
                "-map 0:v:0",
                "-map 0:a?",           
                "-c:v libx264",
                "-c:a aac",
                "-strict -2",
                "-b:a 128k",
                "-ac 2",
                "-hls_time 6",
                "-hls_playlist_type vod",
                `-hls_segment_filename ${segmentPattern}`,
            ])
            .output(outputFile)
            .on("end", () => {
                console.log(`✅ Transcoding completed: ${resolution}p`);
                resolve();
            })
            .on("error", (err) => {
                console.error(`FFmpeg error for ${resolution}p:`, err);
                reject();
            })
            .run();
    });
};