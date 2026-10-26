'use strict';
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// 中间件
app.use(express.json());
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// 路由
const { createWorkbenchRouter } = require('./routes/workbench');
const workbenchRouter = createWorkbenchRouter();
app.use('/api/workbench', workbenchRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 静态托管 demo 目录（http://localhost:3000 → demo/index.html）
app.use(express.static(path.join(__dirname, '..', '..', 'demo')));

app.listen(PORT, HOST, () => {
  console.log(`Lighthouse server listening on ${HOST}:${PORT}`);
});
