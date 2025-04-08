import axios from "axios";
import { tokenGauge, queueLengthGauge } from "../utils/metrics.utils";
import App from "../models/App.models";

export const processQueue = async (appId: string) => {
  const app = await App.findOne({ appId });
  if (!app) return;

  const { queue = [], rateLimiterState } = app;
  const { tokens, lastRefill } = rateLimiterState || {
    tokens: app.rateLimit.maxRequests,
    lastRefill: Date.now(),
  };

  const now = Date.now();
  const elapsedTime = now - lastRefill;
  const tokensToAdd = Math.floor((elapsedTime * app.rateLimit.maxRequests) / app.rateLimit.windowMs);
  let updatedTokens = Math.min(app.rateLimit.maxRequests, tokens + tokensToAdd);

  while (updatedTokens > 0 && queue.length > 0) {
    const nextRequest = queue.shift();
    if (!nextRequest) break;

    try {
      await axios({
        method: nextRequest.method,
        url: nextRequest.url,
        headers: nextRequest.headers,
        data: nextRequest.body,
      });

      console.log(`Processed queued request ${nextRequest.id}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to process queued request ${nextRequest.id}:`, error.message);
      } else {
        console.error(`Failed to process queued request ${nextRequest.id}:`, error);
      }
    }

    updatedTokens -= 1;
  }

  await App.updateOne(
    { appId },
    {
      $set: {
        "rateLimiterState.tokens": updatedTokens,
        "rateLimiterState.lastRefill": now,
        queue,
      },
    }
  );

  // Update metrics
  tokenGauge.set({ appId }, updatedTokens); // Track tokens remaining
  queueLengthGauge.set({ appId }, queue.length); // Track queue length
};

export const startQueueWorker = async () => {
  console.log("Starting queue worker...");
  setInterval(async () => {
    const apps = await App.find({ "queue.0": { $exists: true } });
    for (const app of apps) {
      await processQueue(app.appId);
    }
  }, 5000); // Run every 5 seconds
};