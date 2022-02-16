const Promise = require("bluebird");
const jwt = require("jsonwebtoken");
const verify = Promise.promisify(jwt.verify);

async function check(ctx, next) {
  let url = ctx.request.url;
  // 登录 不用检查
  if (url === "/api/system/login") await next();
  else {
    // 规定token写在header 的 'token'
    let token = ctx.request.headers["token"];
    if(!token) {
      ctx.response.body = {
        code: '405',
        data: null,
        message: '缺少token',
      };
    } else {
      // 解码
      let payload = await verify(token, 'my_sign');
      let { time, timeout } = payload;
      let data = new Date().getTime();
      if (data - time <= timeout) {
        // 未过期
        await next();
      } else {
        //过期
        ctx.response.body = {
          code: '405',
          data: null,
          message: 'token 已过期！',
        };
      }
    }
  }
}

module.exports = check;
