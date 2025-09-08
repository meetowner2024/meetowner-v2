import mysql from "mysql2/promise";
if (!global.mysqlPool) {
  global.mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    multipleStatements: true,
  });
}
const pool = global.mysqlPool;
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to MySQL DB");
    conn.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
})();
export async function query(sql, values, retries = 1) {
  try {
    const [rows] = await pool.query(sql, values);
    return rows;
  } catch (err) {
    if (
      (err.code === "ECONNRESET" || err.code === "PROTOCOL_CONNECTION_LOST") &&
      retries > 0
    ) {
      console.warn("⚠️ Connection lost. Retrying query...");
      return query(sql, values, retries - 1);
    }
    throw err;
  }
}
export default pool;
