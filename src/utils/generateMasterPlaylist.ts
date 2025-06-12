import fs from "fs";
import path from "path";

export function generateMasterPlaylist(outputPath: string, resolutions: string[]) {
    
    const masterPlaylistPath = path.join(outputPath, "master.m3u8");
    let playlist = "#EXTM3U\n";

    // bandwidthMap for each resolution
    const bandwidthMap: Record<number, number> = {
        1080: 4700000,
        720: 2700000,
        480: 1100000,
        360: 500000,  
        240: 150000,  
        144: 80000,
      };

    // width and height for each resolution
    const resolutionMap: Record<number, { width: number; height: number }> = {
        1080: { width: 1920, height: 1080 },
        720: { width: 1280, height: 720 },
        480: { width: 854, height: 480 },
        360: { width: 640, height: 360 },
        240: { width: 426, height: 240 },
        144: { width: 256, height: 144 },
      };

    resolutions.forEach((res) => {
        const height = parseInt(res);
        const { width } = resolutionMap[height];
        playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidthMap[height]},RESOLUTION=1280x${height}\n`;
        playlist += `${res}/output_${res}p.m3u8\n`;
    });

    fs.writeFileSync(masterPlaylistPath, playlist, "utf8");
}