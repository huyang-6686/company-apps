import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 灯塔知识库固定端口（局域网测试端口与应用目录命名规范 v1.0：3003）
const PORT = 3003;
const HOST = '0.0.0.0';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..', 'server');

const require2 = createRequire(import.meta.url);
const net = require2('node:net');
const probe = net.createServer();
probe.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[start:lan] 端口 ${PORT} 已被占用，拒绝启动且不得更换端口。`);
    console.error(`[start:lan] 查询占用：netstat -ano | findstr ":${PORT}"`);
    process.exit(1);
  }
  console.error('[start:lan] 端口检查失败：', err.message);
  process.exit(1);
});
probe.once('listening', () => {
  probe.close(() => {
    console.log(`[start:lan] 端口 ${PORT} 空闲，启动 node src/index.js（HOST=${HOST} PORT=${PORT}）`);
    const child = spawn('node', ['src/index.js'], {
      cwd: serverDir,
      env: { ...process.env, HOST, PORT: String(PORT) },
      stdio: 'inherit',
      shell: true,
    });
    child.on('exit', (code) => process.exit(code ?? 1));
  });
});
probe.listen(PORT, HOST);
