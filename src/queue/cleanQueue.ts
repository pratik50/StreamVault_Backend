// Temporary file to clean the queue manually.

import { Queue } from "bullmq";
import { redisClient } from "../lib/redis"; 

const queue = new Queue("videoQueue", { connection: redisClient });

(async () => {
    await queue.drain(); // removes all jobs (active, delayed, waiting)
    await queue.clean(0, 1000, "completed");
    await queue.clean(0, 1000, "failed");

    // ✅ Clean all resolution status for demo fileIds
    const keys = await redisClient.keys("video-status:*");
    for (const key of keys) {
        await redisClient.del(key);
    }

    console.log("✅ Queue & Redis progress cleaned!");
})();

