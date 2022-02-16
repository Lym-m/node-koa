const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const checkToken = require('./middle/checkToken.js');

// const index = require('./routes/index');
// const users = require('./routes/users');
const system = require('./routes/system');
const bill = require('./routes/bill');

// error handler
onerror(app);

// middlewares

// 下边用了 koabody ，这儿就不要用 bodyparser， 会产生冲突
/*app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))*/
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// koaBody
app.use(koaBody({
  multipart: true,
}));

app.use(checkToken);

// routes
// app.use(index.routes(), index.allowedMethods());
// app.use(users.routes(), users.allowedMethods());
app.use(system.routes(), system.allowedMethods());
app.use(bill.routes(), bill.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app;
