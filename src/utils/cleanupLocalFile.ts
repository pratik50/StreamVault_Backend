import fs from "fs/promises"

export const cleanupLocalFile = async (path: string) => {
    try {
        await fs.rm(path, { recursive: true, force: true });
        console.log("Deleted:", path);
    } catch (err: any) {
            console.error("Failed to delete:", path, err);
        }
};