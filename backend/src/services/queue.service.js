const Queue = require("bull");
const logger = require("../config/logger");

const redisOptions = {
  redis: process.env.REDIS_URL || "redis://localhost:6379",
};

// Create queues
const emailQueue = new Queue("email", redisOptions);
const smsQueue = new Queue("sms", redisOptions);
const reminderQueue = new Queue("reminders", redisOptions);

// Error handling 
[emailQueue, smsQueue, reminderQueue].forEach((queue) => {
  queue.on("error", (err) => logger.error(`Queue error (${queue.name}): ${err.message}`));
  queue.on("failed", (job, err) => logger.warn(`Job failed (${queue.name} ${job.id}): ${err.message}`));
});

module.exports = {
  emailQueue,
  smsQueue,
  reminderQueue,
};
