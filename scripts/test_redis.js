require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

async function main() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('UPSTASH_REDIS_REST_URL or TOKEN is not set in .env.local');
    process.exit(1);
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    console.log('Testing Redis connection...');
    await redis.set('test_key', 'Hello Upstash');
    const value = await redis.get('test_key');
    console.log('Retrieved value:', value);

    if (value === 'Hello Upstash') {
      console.log('Redis connection successful');
      await redis.del('test_key');
    } else {
      console.error('Redis test failed: value mismatch');
    }
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
}

main();
