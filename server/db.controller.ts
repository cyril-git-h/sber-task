import pool from "./db";

export async function addSession(userName: string, data: string):Promise<any>  {
  await pool.query(`INSERT INTO notes (user_name, data) VALUES ($1, $2);`, [userName, data]);
}
export async function getSession(userName: string):Promise<any> {
  return await pool.query(`SELECT data FROM notes WHERE user_name = $1;`, [userName]);
}
