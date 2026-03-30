export const config = {
  port: Number(process.env.PORT ?? 8080),
  databaseProvider: process.env.DATABASE_PROVIDER ?? 'sqlite',
  databaseConnectionString: process.env.DATABASE_CONNECTION_STRING ?? 'order-demo.db',
};
