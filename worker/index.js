import { createClient } from 'redis';
import keys from "./keys.js";


function fib (index) {
	if (index < 2) return 1;
	return fib(index - 1) + fib(index - 2);
}

(async () => {
		const redisClient = createClient({
			url: `redis://${keys.redisHost}:${keys.redisPort}`
		});
		const subscriber = redisClient.duplicate();
		await redisClient.connect()
		await subscriber.connect();
		
		await subscriber.subscribe('insert', async (message) => {
			await redisClient.hSet("values", message, fib(parseInt(message)));
		});
	
		redisClient.on('error', (err) => console.log('Redis Client Error', err));
		subscriber.on('error', (err) => console.log('Redis Subscriber Error', err));
		
})();