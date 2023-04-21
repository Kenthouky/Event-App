import { config } from 'dotenv';
import { Client } from 'redis-om';

config();

const redisCloudConnectionString = `redis://default:yDh1OrYz8yyTIcgzZML1Ve5UmJqVKAcc@redis-17662.c283.us-east-1-4.ec2.cloud.redislabs.com:17662`

const redisClient = new Client();

await redisClient.open(redisCloudConnectionString);

export { redisClient };
