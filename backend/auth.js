import express from 'express';
import db from './db.js';    // 数据库配置
//import cors from 'cors';
import bcrypt from 'bcrypt'; // 密码加密
// excel导入相关模块
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// --------------数据处理说明---------------
// 数据库取到 null 值 直接返回
// 由前端 /store/index.js 里接收到进行null处理

// ----------------格式说明----------------
// 后端返回数据：return response里包含success + 自定义数据
// 例子：res.json({ 
//       success: true, 
//       data: {
//         username: users[0].username
//       } 
//     });
// };


const router = express.Router();
router.use(express.json()); // 显式添加JSON解析

// excel下载和导入 相关参数
// 说明：空模版xlsx放在后端的templates文件夹里面
// 模版xlsx名字在下面的下载函数里面定义
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 用户登录接口
router.post('/login', async (req, res) => {
  //接收到的为 userid，password
  const { userid, password } = req.body;   
  try {
    // users数组保存数据库查询数据
    const [users] = await db.query(
      // 获取密码(服务器上已哈希加密)
      'SELECT userid, username, pwd, bm, roleid, state FROM jzhdb.userinfo WHERE userid = ?', 
      [userid]
    );

    // 与数据库加密好的密码进行比对，数据库如果是明文密码用脚本工具更新为加密密码
    if (users.length > 0 && await bcrypt.compare(password, users[0].pwd)) {
      // 存储完整用户信息到Session
      req.session.user = { 
        userid: users[0].userid,  // 关键：login时存储在session里
        username: users[0].username,
        bm: users[0].bm,
        roleid: users[0].roleid
      };

      const { pwd, ...safeUser } = users[0]; 
      res.json({ success: true, 
        user: safeUser 
      });
    } else {
      res.status(401).json({ success: false, message: 'ERROR401 用户名或密码错误' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'ERROR500 服务器错误' });
  }
});

// 密码修改接口
router.post('/change-password', async (req, res) => {
  const { userid, oldPassword, newPassword } = req.body;
  try {
    const [users] = await db.query(
      'SELECT pwd FROM userinfo WHERE userid = ?',
      [userid]
    );
    
    // // 服务端log 测试用
    // console.log(userid + ' 用户查询结果:', users.length > 0 ? '存在' : '不存在');
    // if (users.length === 0 || !await bcrypt.compare(oldPassword, users[0].pwd)) {
    //   return res.status(401).json({ success: false, message: '旧密码错误' });
    // }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);    // 对新密码进行加密
    await db.query(
      'UPDATE userinfo SET pwd = ? WHERE userid = ?',
      [hashedPassword, userid]
    );
    
    res.json({ success: true, 
      message: '密码更新成功' 
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ success: false, message: '密码更新失败' });
  }
});

// 首页 获取当前用户名字
router.post('/get_username', async (req, res) => {
  try {
    // 从Session获取用户ID
    const userid = req.session.user?.userid;
    if (!userid){
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const [users] = await db.query(
      'SELECT username FROM jzhdb.userinfo WHERE userid = ?', 
      [userid]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ 
      success: true, 
      data: {
        username: users[0].username
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '数据获取失败' });
  }
});


// 首页 获取部门价值户户数信息
router.post('/get_bmjzh_hz', async (req, res) => {
  try {
    // 从Session获取用户ID
    const userid = req.session.user?.userid;
    // console.log('userId ' + userId);
    if (!userid){
      return res.status(401).json({ success: false, message: '未登录' });
    }

    // 查询每个部门价值户数据
    const [bmjzh_hz] = await db.query(`
      SELECT a.bm, t.num from jzhdb.bm a 
      left join(
        select d.bm, count(*) num
        from jzhdb.jzhmx a
        join jzhdb.sb c on a.客户编号 = c.客户号
        join jzhdb.userinfo d on c.username = d.username
        where a.零售价值客户标志 = '是'
        group by d.bm) t
        on a.bm = t.bm
        order by a.bmid
    `);
    // console.log(bmjzh_hz);
    res.json({ 
      success: true, 
      data: bmjzh_hz 
    });
  } catch (err) {
    console.error('获取价值户数据失败:', err);
    res.status(500).json({ success: false, message: '数据获取失败' });
  }
});

// 价值户申报接口
router.post('/declare_jzh', async (req, res) => {
  try {
    const username = req.session.user?.username;
    const { kehuhao } = req.body;
    
    if (!username) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    if (!kehuhao) {
      return res.status(400).json({ success: false, message: '客户号不能为空' });
    }
    
    // 检查是否已申报过该客户
    const [existing] = await db.query(
      'SELECT * FROM jzhdb.sb WHERE 客户号 = ? AND username = ?',
      [kehuhao, username]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: '您已申报过该客户' 
      });
    }
    
    // 插入新申报记录
    await db.query(
      'INSERT INTO jzhdb.sb (客户号, username) VALUES (?, ?)',
      [kehuhao, username]
    );
    
    res.json({ 
      success: true,
      message: '申报成功'
    });
  } catch (err) {
    console.error('申报失败:', err);
    res.status(500).json({ success: false, message: '申报失败' });
  }
});

// 下载Excel导入模板
router.get('/download_import_template', (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'templates', 'value_customer_import_template.xlsx');
    res.download(templatePath, '价值户导入模板.xlsx');
  } catch (err) {
    console.error('模板下载失败:', err);
    res.status(500).json({ success: false, message: '模板下载失败' });
  }
});

// Excel批量导入接口
router.post('/import_jzh', async (req, res) => {
  try {
    const username = req.session.user?.username;
    if (!username) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: '未上传文件' });
    }

    const excelFile = req.files.file;
    const workbook = xlsx.read(excelFile.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 解析Excel数据
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    // 校验数据格式
    if (!jsonData.length || !jsonData[0].hasOwnProperty('客户号')) {
      return res.status(400).json({ 
        success: false, 
        message: '文件格式错误，请使用提供的模板' 
      });
    }

    const successItems = [];
    const failedItems = [];
    
    // 批量处理导入数据
    for (const row of jsonData) {
      try {
        const kehuhao = String(row['客户号']).trim();
        
        // 客户号基础校验
        if (!kehuhao || kehuhao.length < 6 || kehuhao.length > 20) {
          throw new Error('客户号格式错误');
        }
        
        // 检查是否已存在
        const [existing] = await db.query(
          'SELECT * FROM jzhdb.sb WHERE 客户号 = ? AND username = ?',
          [kehuhao, username]
        );
        
        if (existing.length > 0) {
          throw new Error('该客户号已存在');
        }
        
        // 插入新记录
        await db.query(
          'INSERT INTO jzhdb.sb (客户号, username) VALUES (?, ?)',
          [kehuhao, username]
        );
        
        successItems.push({ kehuhao });
      } catch (error) {
        failedItems.push({
          kehuhao: row['客户号'],
          error: error.message || '导入失败'
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        successCount: successItems.length,
        failureCount: failedItems.length,
        failedItems
      }
    });
  } catch (err) {
    console.error('批量导入失败:', err);
    res.status(500).json({ 
      success: false, 
      message: '批量导入失败: ' + err.message 
    });
  }
});

// 价值户明细页 查看个人自己价值户明细（带分页）
router.post('/get_jzhmx_by_username', async (req, res) => {
  try {
    const username = req.session.user?.username;
    if (!username) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    // 获取分页参数（默认为第1页，每页15条）
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 15;
    const offset = (page - 1) * pageSize;

    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM jzhdb.jzhmx a
       JOIN jzhdb.sb b ON a.客户编号 = b.客户号
       WHERE b.username = ?`,
      [username]
    );
    const total = countResult[0].total;

    // 查询分页数据
    const [jzhmx] = await db.query(
      `SELECT a.数据日期 AS date, 
              a.客户编号 AS customerId,
              a.零售价值客户标志 AS valueFlag,
              a.个人客户中文名称 AS customerName,
              a.零售价值客户达标原因 AS reason,
              b.username AS username
       FROM jzhdb.jzhmx a
       JOIN jzhdb.sb b ON a.客户编号 = b.客户号
       WHERE b.username = ?
       LIMIT ? OFFSET ?`,
      [username, pageSize, offset]
    );

    // console.log('当前用户名: ' + username );
    // console.log('名下总户数: ' + total );

    res.json({
      success: true,
      data: {
        list: jzhmx,
        total: total,
        currentPage: page,
        pageSize: pageSize
      }
    });
  } catch (err) {
    console.error('获取个人价值户数据失败:', err);
    res.status(500).json({ success: false, message: '数据获取失败' });
  }
});

export default router;