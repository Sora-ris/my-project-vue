import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Alexbao123',
  database: 'jzhdb',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool; // 统一使用ES6导出