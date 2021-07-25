"use strict";
var mysql = require("mysql");
var pool = mysql.createPool({
    host: '35.244.114.32',
    user: 'root',
    password: 'nullorcmd',
    database: 'baby_formula',
    port: '3306'
});
exports.query = function (sql, arr, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        connection.query(sql, arr, function (error, result) {
            callback && callback(error, result);
        });
        pool.releaseConnection(connection);
    });
};
exports.pool = pool;
