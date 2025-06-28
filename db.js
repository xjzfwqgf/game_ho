// 数据库连接配置
const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'sql.wsfdb.cn',
    port: 3306,
  user: 'qwqweqweaaaaa', // 请替换为实际用户名
  password: 'aaaaa', // 请替换为实际密码
  database: 'qwqweqweaaaaa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
module.exports = pool.promise();
