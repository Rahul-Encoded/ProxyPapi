import App from "../models/App.models";
import axios from "axios";

// Generate a unique ID for each queued request
const generateQueueId = () => `queue_${crypto.randomUUID()}`;

// Process the queue for a specific app
export const processQueue = async (appId: string) => {
  const app = await App.findOne({ appId });
  if (!app) return;

  const { queue = [], rateLimiterState } = app;
  const { tokens, lastRefill } = rateLimiterState || {
    tokens: app.rateLimit.maxRequests,
    lastRefill: Date.now(),
  };

  // Refill tokens based on elapsed time
  const now = Date.now();
  const elapsedTime = now - lastRefill;
  const tokensToAdd = Math.floor((elapsedTime * app.rateLimit.maxRequests) / app.rateLimit.windowMs);
  let updatedTokens = Math.min(app.rateLimit.maxRequests, tokens + tokensToAdd);

  // Process queued requests if tokens are available
  while (updatedTokens > 0 && queue.length > 0) {
    const nextRequest = queue.shift(); // Dequeue the oldest request
    if (!nextRequest) break;

    try {
      // Forward the queued request to the target API
      const response = await axios({
        method: nextRequest.method,
        url: nextRequest.url,
        headers: nextRequest.headers,
        data: nextRequest.body,
      });

      console.log(`Processed queued request ${nextRequest.id} with status ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to process queued request ${nextRequest.id}:`, error.message);
      } else {
        console.error(`Failed to process queued request ${nextRequest.id}:`, error);
      }
    }

    updatedTokens -= 1; // Consume one token
  }

  // Update the app's state in MongoDB
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
};

// Rate limiter with queueing mechanism
export const tokenBucketRateLimiter = async (
  appId: string,
  rateLimit: { maxRequests: number; windowMs: number },
  requestDetails: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
  }
): Promise<{ allowed: boolean; remaining: number }> => {
  const { maxRequests, windowMs } = rateLimit;

  // Find the app and its rate-limiter state
  const app = await App.findOne({ appId });
  if (!app) throw new Error("App not found");

  const now = Date.now();
  const { tokens, lastRefill } = app.rateLimiterState || {
    tokens: maxRequests,
    lastRefill: now,
  };

  // Refill tokens based on elapsed time
  const elapsedTime = now - lastRefill;
  const tokensToAdd = Math.floor((elapsedTime * maxRequests) / windowMs);
  const updatedTokens = Math.min(maxRequests, tokens + tokensToAdd);

  // Check if there are enough tokens
  if (updatedTokens > 0) {
    // Consume one token
    const remainingTokens = updatedTokens - 1;

    // Update the rate-limiter state in MongoDB
    await App.updateOne(
      { appId },
      {
        $set: {
          "rateLimiterState.tokens": remainingTokens,
          "rateLimiterState.lastRefill": now,
        },
      }
    );

    return { allowed: true, remaining: remainingTokens };
  }

  // No tokens available - Enqueue the request
  const queueId = generateQueueId();
  await App.updateOne(
    { appId },
    {
      $push: {
        queue: {
          id: queueId,
          timestamp: now,
          method: requestDetails.method,
          url: requestDetails.url,
          headers: requestDetails.headers,
          body: requestDetails.body,
        },
      },
    }
  );

  console.log(`Queued request ${queueId} due to insufficient tokens`);
  return { allowed: false, remaining: updatedTokens };
};