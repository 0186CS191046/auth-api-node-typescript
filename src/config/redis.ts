import { createClient, type RedisClientType } from "redis";
import { config } from "./config.js";

export const client = createClient({
    url:config.redis.url
});

async function connectToRedis(): Promise<void> {
    await client.connect();
    console.log("Client connected successfully!");
}

client.on('error', (err: Error) => {
    console.error("Error connecting to redis : ",err);
});

connectToRedis().catch(console.error);