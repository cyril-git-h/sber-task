import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

export default new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST || "localhost",
  database: "notes",
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});
