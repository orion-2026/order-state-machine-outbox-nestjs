export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseProvider: process.env.DATABASE_PROVIDER ?? 'sqlite',
  databasePath: process.env.DATABASE_PATH ?? 'order-demo.db',
};
