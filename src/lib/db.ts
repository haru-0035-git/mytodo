import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(process.env.DATABASE_URL!);
    console.log("MySQL Connection Pool created.");
  }
  return pool;
};

// ★★★ 変更点: paramsの型にnullを許可する ★★★
export async function query<T>(
  sql: string,
  params: (string | number | null)[]
): Promise<T> {
  const connectionPool = getPool();
  const [results] = await connectionPool.execute(sql, params);
  return results as T;
}
