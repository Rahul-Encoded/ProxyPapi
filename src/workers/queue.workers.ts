import App from "../models/App.models";
import { processQueue } from "../utils/rateLimiter.utils";

// Process all queues every 5 seconds
const startQueueWorker = async () => {
  console.log("Starting queue worker...");
  setInterval(async () => {
    const apps = await App.find({ "queue.0": { $exists: true } }); // Find apps with non-empty queues
    for (const app of apps) {
      await processQueue(app.appId);
    }
  }, 5000); // Run every 5 seconds
};

export default startQueueWorker;