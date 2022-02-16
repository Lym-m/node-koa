const router = require('koa-router')();
const query = require('../lib/mysql.js');

router.prefix('/api/bill');

router.post('/create', async (ctx, next) => {
  console.log('bill create-------------------------- \n');
  const userId = ctx.request.body.userId;
  const type = ctx.request.body.type;
  const typeName = ctx.request.body.typeName;
  const date = ctx.request.body.time;
  const value = ctx.request.body.value;
  const remark = ctx.request.body.remark;
  if (!userId || !date || !value || type === undefined || !typeName) {
    ctx.response.body = {
      code: '-1',
      data: null,
      message: '缺少必要参数！',
    };
    return false;
  }
  const sqlStr = `INSERT INTO detail(userId, type, typeName, date, value, remark) VALUES (${userId}, ${type}, '${typeName}', '${date}', '${value}', '${remark}');`;
  const result = await new Promise(((resolve, reject) => {
    return query(sqlStr, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  if (result.insertId) {
    ctx.response.body = {
      code: '0',
      data: null,
      message: '新增成功！',
    };
  } else {
    ctx.response.body = {
      code: '-1',
      data: null,
      message: '新增失败！',
    };
  }
});

router.post('/setBudget', async (ctx, next) => {
  console.log('setBudget-------------------------- \n');
  const userId = ctx.request.body.userId;
  const date = ctx.request.body.date;
  const budgetNumber = ctx.request.body.budgetNumber;
  console.log('userId:' + userId + '  date:' + date + '  budgetNumber:' + budgetNumber);
  if (!userId || !date || !budgetNumber) {
    ctx.response.body = {
      code: '-1',
      data: null,
      message: '缺少必要参数！',
    };
    return false;
  }
  const querySql = `select * from budget where userId=${userId} and date='${date}';`;
  const queryResult = await new Promise(((resolve, reject) => {
    return query(querySql, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  let operateSql = '';
  if (queryResult && queryResult.length > 0) {
    operateSql = `UPDATE budget SET num=${Number(budgetNumber)} WHERE userId=${userId} AND date='${date}';`
  } else {
    operateSql = `INSERT INTO budget(userId, date, num) VALUES (${userId}, '${date}', ${Number(budgetNumber)})`;
  }
  const operateResult = await new Promise(((resolve, reject) => {
    return query(operateSql, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  if (operateResult.affectedRows === 1) {
    ctx.response.body = {
      code: '0',
      data: null,
      message: '操作成功！',
    };
  } else {
    ctx.response.body = {
      code: '-1',
      data: null,
      message: '操作失败',
    };
  }
});

router.post('/list', async (ctx, next) => {
  console.log('bill list-------------------------- \n');
  const date = ctx.request.body.time;
  const pageSize = ctx.request.body.pageSize;
  const currentPage = ctx.request.body.currentPage;
  console.log('date:' + date + '  pageSize:' + pageSize + '  currentPage:' + currentPage);
  if (!date || !pageSize || !currentPage) {
    ctx.response.body = {
      code: '-1',
      data: null,
      message: '缺少必要参数！',
    };
    return false;
  }
  const sqlStr = `select * from detail where date like '${date}%' limit ${(currentPage - 1) * pageSize},${currentPage * pageSize};`;
  const result = await new Promise(((resolve, reject) => {
    return query(sqlStr, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  const totalStr = `select count(1) from detail where date like '${date}%';`;
  const totalResult = await new Promise(((resolve, reject) => {
    return query(totalStr, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  const total = totalResult[0]['count(1)'];
  ctx.response.body = {
    code: '0',
    data: {
      list: result,
      total: total,
    },
    message: '查询成功！',
  };
});

router.post('/getBudget', async (ctx, next) => {
  console.log('getBudget-------------------------- \n');
  const userId = ctx.request.body.userId;
  const date = ctx.request.body.date;
  console.log('userId:' + userId + '  date:' + date);
  if (!userId || !date) {
    ctx.response.body = {
      code: '-1',
      data: null,
      message: '缺少必要参数！',
    };
    return false;
  }
  const totalSql = `select * from budget where userId=${userId} and date='${date}';`;
  const totalResult = await new Promise(((resolve, reject) => {
    return query(totalSql, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  console.log(totalResult);
  const detailSql = `select * from detail where userId=${userId} and date like '${date}%';`;
  const detailResult = await new Promise(((resolve, reject) => {
    return query(detailSql, function (err, val) {
      if (err) {
        throw err;
      }
      resolve(val);
    })
  }));
  console.log(detailResult);
  let data = {
    total: 0.00,
    income: 0.00,
    spend: 0.00,
  };
  if(totalResult.length !== 0){
    data.total = totalResult[0].num;
  }
  if(detailResult.length !== 0){
    let [spend, income] = [0, 0];
    detailResult.forEach(item => {
      if (item.type === 0) {
        spend += Number(item.value);
      } else {
        income += Number(item.value);
      }
    });
    data.spend = spend;
    data.income = income;
  }
  ctx.response.body = {
    code: '0',
    data,
    message: '查询成功！',
  };
});
module.exports = router;
