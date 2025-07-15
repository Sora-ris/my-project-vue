import bcrypt from 'bcrypt';
import db from '../db.js';

// 给数据库中的明文用户密码加密并更新存储
// 必须加密后才能在登录时验证通过
async function migratePasswords() {
  try {
    // 1. 查询所有明文密码的用户
    const [users] = await db.query('SELECT userid, pwd FROM userinfo');
    
    for (const user of users) {
      // 2. 生成Bcrypt哈希（盐值轮数建议为10）
      const hashedPassword = await bcrypt.hash(user.pwd, 10);
      
      // 3. 更新数据库
      await db.query('UPDATE userinfo SET pwd = ? WHERE userid = ?', [
        hashedPassword, 
        user.userid
      ]);
      console.log(`用户 ${user.userid} 密码已加密`);
    }
  } catch (err) {
    console.error('迁移失败:', err);
  }
}

migratePasswords();