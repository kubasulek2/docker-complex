const keys = require("./keys");
const express = require("express");
const { json } = require("body-parser");
const cors = require("cors");
const { createClient } = require("redis");
const { Pool } = require("pg");


const PORT = (process.env.NODE_ENV === 'production' ? process.env.BACKEND_PROD_PORT : process.env.BACKEND_DEV_PORT) || 5000;
const app = express();

const redisClient = createClient({
	url: `redis://${keys.redisHost}:${keys.redisPort}`
});

const pgClient = new Pool({
	host: keys.pgHost,
	port: keys.pgPort,
	user: keys.pgUser,
	password: keys.pgPassword,
	database: keys.pgDatabase,
});

app.use(cors());
app.use(json({ extended: false }));

app.get("/values/all", async (req, res) => {
	const values = await pgClient.query("SELECT * from values");
	res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
	const values = await redisClient.hGetAll("values");
	res.send(values);
});

app.post("/values", async (req, res) => {
	const index = req.body.index;

	if (parseInt(index) > 40)
		return res.status(422).json({ message: "Index too high", code: 422 });

	await redisClient.hSet("values", index, "nil");
	await redisClient.publish("insert", index);
	await pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

	res.json({ ok: true });
});

pgClient.on("error", (error) => {
	console.log("error pg");
	console.log(error);
	process.exit(1);
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

async function bootstrap () {
	let client;
	try {
		await redisClient.connect();
		console.log("Redis connected");

		client = await pgClient.connect();
		console.log("Postgres connected");

		await client.query("CREATE TABLE IF NOT EXISTS values (number INT)");
		await client.end();
		app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
	} catch (e) {
		console.error("error: ", e);
		process.exit(1);
	}
}

async function gracefulShutdown () {
	if (gracefulShutdown.inProgress) return;
	gracefulShutdown.inProgress = true;
	await pgClient.end();
	await redisClient.disconnect();
	process.exit(0);
}
gracefulShutdown.inProgress = false;

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown); // Sent by nodemon

bootstrap();

module.exports = { app, pgClient, redisClient };
