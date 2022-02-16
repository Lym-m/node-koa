const router = require('koa-router')();
const query = require('../lib/mysql.js');

router.prefix('/api/system');

router.post('/getUserInfo', function (ctx, next) {
    console.log('userInfo-------------------------- \n');
    let sqlStr = `select * from user;`;
    query(sqlStr, function (err, val) {
        console.log(val);
    })
});

module.exports = router;
