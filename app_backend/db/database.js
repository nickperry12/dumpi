import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.HOST

const pool = new Pool(
  {
    user,
    host,
    password,
    database: 'request_bin_db',
    port: 5432
  }
);

pool.on('connect', () => {
  console.log('Successfully connected to database!');
});

const query = (text, params) => pool.query(text, params);

export { query } ;