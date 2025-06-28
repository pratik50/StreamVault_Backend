import fs from "fs/promises";
import path from "path";
import { uploadToS3 } from "./uploadToS3";

export async function uploadFolderToS3(localDir: string, s3Prefix: string): Promise<void> {

    const files =  await fs.readdir(localDir, { withFileTypes: true });

    for(const file of files){
        const fullPath = path.join(localDir,file.name);
        const s3Key = `${s3Prefix}/${file.name}`;

        if(file.isDirectory()){
            await uploadFolderToS3(fullPath,s3Key);
        }else{
            const buffer = await fs.readFile(fullPath);
            const mimeType = file.name.endsWith(".m3u8")
                ? "application/vnd.apple.mpegurl"
                : "video/MP2T";  
            
            await uploadToS3(buffer,s3Key,mimeType,false);
            
        }
    }
}