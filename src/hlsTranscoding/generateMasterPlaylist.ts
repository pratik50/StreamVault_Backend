import fs from "fs";
import path from "path";
import { bandwidthMap, HLSResolution } from "./hlsUlits";

export function generateMasterPlaylist(outputPath: string, resolutions: HLSResolution[]) {
    

    const masterPlaylistPath = path.join(outputPath, "master.m3u8");
    let playlist = "#EXTM3U\n";

    resolutions.forEach((res) => {
        const height = res.height;
        const bandwidth = bandwidthMap[height] || 500000;

        playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=1280x${height}\n`;
        playlist += `${height}/output_${height}p.m3u8\n`;
    });

    fs.writeFileSync(masterPlaylistPath, playlist, "utf8");
}