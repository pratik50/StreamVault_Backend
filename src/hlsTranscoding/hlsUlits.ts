import { execSync } from "child_process";

export const getOriginalResolution = (inputPath: string) => {
    try{
        const orginalheight = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${inputPath}"`);
        return parseInt(orginalheight.toString().trim());
    }catch(err) {
        console.error("Failed to get video resolution", err);
        throw new Error("unable to extract video height");
    }
}

export const getValidResolutionVariants = (vidoeHeight: number, inputPath: string) => {
    try {
        const validRes = HLS_RESOLUTIONS.filter(height => vidoeHeight >= height.height);
        return validRes;
    }catch(err) {
        console.error("Unable to find the valid resolutions for ",{inputPath}, err);
        throw new Error("error for findig valid res");
    }
}

// Type for HLS_Resolution
export type HLSResolution = {
    height: number;
    label: string;
};

// Constant Video Resolutions
export const HLS_RESOLUTIONS: HLSResolution[] = [
    { height: 4320, label: "8k" },
    { height: 2160, label: "4k" },
    { height: 1440, label: "2k" },
    { height: 1080, label: "1080p" },
    { height: 720, label: "720p" },
    { height: 480, label: "480p" },
    { height: 360, label: "360p" },
    { height: 240, label: "240p" },
    { height: 144, label: "144p" }
];

// bandwidthMap for each resolution
export const bandwidthMap: Record<number, number> = {
    4320:   20000000, 
    2160:   12000000, 
    1440:   6500000,  
    1080:   4700000,  
    720:    2700000,
    480:    1100000,
    360:    500000,
    240:    150000,
    144:    80000,
};