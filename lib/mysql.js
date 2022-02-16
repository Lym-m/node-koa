const mysql = require("mysql");
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ym'
});

const query = (sql, callback) => {
    pool.getConnection((err, connection) => {
        if(err) {
            callback(err, null, null);
        } else {
            connection.query(sql, (err, rows) => {
                callback(err, rows);
                connection.release();
            });
        }
    });
};

module.exports = query;
