import { redisClient } from "./redis";

//keeping the eye on resolution completed for sefty purpose
export async function setResolutionStatus(fieldId: string, resolution: number, status: string) {
    const key = `video-status:${fieldId}`;
    await redisClient.hset(key, resolution, status);
}

// returning the status of the job from hashset
export async function getAllResolutionStatus(fieldId: string) {
    const key = `video-status:${fieldId}`;
    return await redisClient.hgetall(key);
}

