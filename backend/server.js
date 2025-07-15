import express from 'express';
import cors from 'cors';
import authRouter from './auth.js';
import session from 'express-session'; // 新增Session模块 用户保存用户登录信息

const app = express();
const PORT = 3000;      // 服务端端口

//（注意顺序：Session->CORS->JSON->路由）
// ==== 新增Session配置 ====
app.use(session({
  secret: '123456', // 生产环境用环境变量替换
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24小时有效期
    httpOnly: true // 防止XSS攻击
  }
}));
// 中间件配置（移除问题路由）
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ⚠️ 删除此行：app.options('*', cors()); 
app.use(express.json());
//app.use('/api', authRouter);
app.use(authRouter);          // 服务端监听不带api的url   在vite.config中配置了自动删除/api


// 服务端页面默认显示
app.get('/', (req, res) => {
  res.send('后端服务已启动，内网可访问 当前时间：' + new Date().toLocaleString());
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// 优雅关闭
const gracefulShutdown = () => {
  server.close(async () => {
    console.log("HTTP 服务已停止");
    await db.end(); // 使用连接池的 end() 方法[3](@ref)
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000); 
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// 全局错误捕获
process.on('unhandledRejection', (err) => {
  console.error('未处理的Promise异常:', err);
});