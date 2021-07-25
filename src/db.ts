const mysql = require("mysql");

let pool = mysql.createPool({
  host: '35.244.114.32',
	user: 'root',
	password: 'nullorcmd',
	database: 'baby_formula',
	port: '3306'
});

exports.query = function (sql:string, arr:any, callback: any) {
  pool.getConnection(function (err : never, connection: any) {
    if (err) {
      throw err;
    }
    connection.query(sql, arr, function (error: never, result: any) {
      callback && callback(error, result);
    });
    pool.releaseConnection(connection);
  });
};

exports.pool = pool;