import { Queue } from "bullmq";
import { redisClient } from "../lib/redis";

export const videoQueue = new Queue("videoQueue", {
    connection: redisClient
})