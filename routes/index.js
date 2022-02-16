const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});

router.get('/string', async (ctx, next) => {
  console.log(ctx.request.body);
  ctx.body = 'koa2 string'
});

router.post('/json', async (ctx, next) => {
  console.log(ctx.request.body);
  ctx.body = {
    title: 'koa2 json'
  }
});

module.exports = router;
