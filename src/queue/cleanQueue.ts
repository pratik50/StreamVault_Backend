import { Queue } from "bullmq";
import { redisClient } from "../lib/redis"; // same client used by your app

const queue = new Queue("videoQueue", { connection: redisClient });

(async () => {
    await queue.drain(); // removes all jobs (active, delayed, waiting)
    await queue.clean(0, 1000, "completed");
    await queue.clean(0, 1000, "failed");
    console.log("✅ Queue cleaned!");
})();