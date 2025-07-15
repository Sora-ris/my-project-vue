// 测试数据库是否连通   node db-test.js 运行

import pool from './db.js';
pool.query('SELECT 1 + 1 AS result')
  .then(([rows]) => console.log('数据库连接成功:', rows[0].result))
  .catch(err => console.error('数据库连接失败:', err.message));