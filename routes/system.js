const router = require('koa-router')();
const query = require('../lib/mysql.js');
const fs = require('fs');
const path = require('path');
const send = require('koa-send');
const {getIPAddress} = require('../lib/utils');
const jwt = require('jsonwebtoken');

router.prefix('/api/system');

router.post('/login', async (ctx, next) => {
    console.log('LOGIN-------------------------- \n');
    const username = ctx.request.body.account;
    const password = ctx.request.body.password;
    console.log(username, password);
    const result = await new Promise(((resolve, reject) => {
        return query(`select * from user where username='${username}';`, function (err, val) {
            if (err) {
                throw err;
            }
            resolve(val);
        })
    }));
    console.log(result);
    if(result && result.length > 0 && result[0].password === password){
        let payload = {userId: result[0].id,time:new Date().getTime(),timeout:1000*60*60*2};
        let token = jwt.sign(payload, 'my_sign');
        ctx.response.body = {
            code: '0',
            data: {
                id: result[0].id,
                name: result[0].name,
                phone: result[0].phone,
                age: result[0].age,
                address: result[0].address,
                headurl: result[0].headurl,
                token,
            },
            message: '登陆成功！',
        };
    } else {
        ctx.response.body = {
            code: '-1',
            data: null,
            message: '账号或密码错误！',
        };
    }
});

router.post('/upload', async (ctx, next) => {
    console.log('upload---------------------------------');
    const file = ctx.request.files.file;
    const reader = fs.createReadStream(file.path);
    let filePath = path.join(__dirname, '../', 'public/images') + `/${file.name}`;
    const upStream = fs.createWriteStream(filePath);
    reader.pipe(upStream);
    const ip = getIPAddress();
    const url = `http://${ip}:3000/images/${file.name}`;
    ctx.response.body = {
        code: '0',
        data: {
            path: url
        },
        message: '上传成功！',
    }
});

router.post('/updateInfo', async (ctx, next) => {
    const id = ctx.request.body.id;
    const name = ctx.request.body.name;
    const age = ctx.request.body.age;
    const phone = ctx.request.body.phone;
    const address = ctx.request.body.address;
    const headurl = ctx.request.body.picture;

    if(!id || !name || !phone) {
        ctx.response.body = {
            code: '-1',
            data: null,
            message: '缺少必要参数！'
        }
    } else {
        const sql = `UPDATE user SET name='${name}', age=${age}, phone='${phone}', address='${address}', headurl='${headurl}' WHERE id=${id};`;
        const result = await new Promise(((resolve, reject) => {
            return query(sql, function (err, val) {
                if (err) {
                    throw err;
                }
                resolve(val);
            })
        }));
        if(result) {
            ctx.response.body = {
                code: '0',
                data: null,
                message: '修改成功！'
            }
        }
    }
});

router.get('/download',async (ctx, next) => {
    ctx.response.set(
        'Content-Disposition',
        `attachment; filename=${encodeURIComponent('详细数据')}.xlsx`
    );
    const path = `public/file/详细数据.xlsx`;
    ctx.set('Content-type', 'application/x-msdownload');
    ctx.attachment(path);
    await send(ctx, path);
});

module.exports = router;
