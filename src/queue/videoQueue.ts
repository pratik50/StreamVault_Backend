import { Queue } from "bullmq";
import { redisClient } from "../lib/redis";

export const videoQueue = new Queue("videoQueue", {
    connection: redisClient,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: {
            age: 3600
        }
    }
})