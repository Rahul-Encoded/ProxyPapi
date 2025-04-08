import promClient from "prom-client";

// Create a registry for Prometheus metrics
const register = new promClient.Registry();

// Define metrics
const requestCounter = new promClient.Counter({
  name: "proxy_request_total",
  help: "Total number of requests processed by the proxy API",
  labelNames: ["status"], // Labels: success, failure, queued
});

const tokenGauge = new promClient.Gauge({
  name: "proxy_tokens_remaining",
  help: "Number of tokens remaining in the token bucket",
  labelNames: ["appId"],
});

const queueLengthGauge = new promClient.Gauge({
  name: "proxy_queue_length",
  help: "Number of requests currently in the queue",
  labelNames: ["appId"],
});

const requestDurationHistogram = new promClient.Histogram({
  name: "proxy_request_duration_seconds",
  help: "Histogram of request durations to target APIs",
  buckets: [0.1, 0.5, 1, 2, 5], // Define latency buckets
});

// Register metrics
register.registerMetric(requestCounter);
register.registerMetric(tokenGauge);
register.registerMetric(queueLengthGauge);
register.registerMetric(requestDurationHistogram);

export { register, requestCounter, tokenGauge, queueLengthGauge, requestDurationHistogram };