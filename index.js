// 多人斗地主 服务端基础
const http = require('http');
const db = require('./db');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, msg: '用户名和密码不能为空' });
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE nick_name = ?', [username]);
    if (rows.length > 0) return res.json({ success: false, msg: '用户名已存在' });
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO user (nick_name, password, email) VALUES (?, ?, ?)', [username, hash, username + '@ddz.com']);
    res.json({ success: true, msg: '注册成功' });
  } catch (e) {
    res.json({ success: false, msg: e.message || '注册失败' });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, msg: '用户名和密码不能为空' });
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE nick_name = ?', [username]);
    if (rows.length === 0) return res.json({ success: false, msg: '用户不存在' });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.json({ success: false, msg: '密码错误' });
    res.json({ success: true, msg: '登录成功', user: { id: rows[0].id, nick_name: rows[0].nick_name, email: rows[0].email, avatar: rows[0].avatar } });
  } catch (e) {
    res.json({ success: false, msg: e.message || '登录失败' });
  }
});

// 用户信息
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, nick_name, email, avatar FROM user WHERE id = ?', [id]);
    if (rows.length === 0) return res.json({ success: false, msg: '用户不存在' });
    res.json({ success: true, user: rows[0] });
  } catch (e) {
    res.json({ success: false, msg: '查询失败' });
  }
});

// 房间数据（内存，生产建议持久化）
const rooms = {};

// 创建/加入房间
app.post('/api/room/join', (req, res) => {
  const { roomId, user } = req.body;
  if (!roomId || !user) return res.json({ success: false, msg: '参数缺失' });
  if (!rooms[roomId]) rooms[roomId] = { users: [] };
  if (!rooms[roomId].users.find(u => u.name === user)) {
    rooms[roomId].users.push({ id: Date.now() + Math.random(), name: user });
  }
  res.json({ success: true, users: rooms[roomId].users });
});

// 获取房间成员
app.get('/api/room/:roomId/users', (req, res) => {
  const { roomId } = req.params;
  if (!rooms[roomId]) return res.json({ success: false, users: [] });
  res.json({ success: true, users: rooms[roomId].users });
});

app.listen(3001, () => {
  console.log('斗地主服务端已启动，端口3001');
});
