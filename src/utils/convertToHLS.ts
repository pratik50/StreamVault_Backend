import fs from "fs"
import path from "path"
import ffmpeg from "fluent-ffmpeg";

const heightMap = {
    "1080": 1080,
    "720": 720,
    "480": 480,
    "360": 360,
    "240": 240,
    "144": 144,
  };

export const converToHLS = (
    inputPath: string, 
    hlsOutputPath: string, 
    resolution: keyof typeof heightMap
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const height = heightMap[resolution];

        if(!fs.existsSync(hlsOutputPath)){
            fs.mkdirSync(hlsOutputPath, {recursive: true});
        }

        const diffResFolder = path.join(hlsOutputPath, resolution);

        if(!fs.existsSync(diffResFolder)){
            fs.mkdirSync(diffResFolder, {recursive: true});
        }

        const outputFile = path.join(diffResFolder, `output_${resolution}p.m3u8`);
        const segmentPattern = path.join(diffResFolder,`segment_${resolution}_%03d.ts`); 

        // IMP (actual hls chunks creation for the vedio)
        ffmpeg(inputPath)
            .addOptions([
                `-vf scale=-2:${height}`,
                "-preset veryfast",
                "-g 48",
                "-sc_threshold 0",
                "-map 0:v:0",
                "-c:v libx264",
                "-c:a aac",
                "-strict -2",
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