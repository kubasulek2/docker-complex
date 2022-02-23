module.exports =  {
	redisHost: process.env.REDIS_HOST || 'localhost',
	redisPort: process.env.REDIS_PORT || 6379,
	pgHost: process.env.PGHOST,
	pgUser: process.env.PGUSER,
	pgPort: process.env.PGPORT || 5432,
	pgDatabase: process.env.PGDATABASE,
	pgPassword: process.env.POSTGRES_PASSWORD,
}