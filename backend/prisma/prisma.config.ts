import type { DataSource } from 'prisma';

const datasource: DataSource = {
  url: process.env.DATABASE_URL,
};

export default datasource;
