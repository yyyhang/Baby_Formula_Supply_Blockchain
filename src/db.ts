import { resolve } from "path/posix";

const mysql = require("mysql");

let pool = mysql.createPool({
  host: '35.244.114.32',
	user: 'root',
	password: 'nullorcmd',
	database: 'baby_formula',
	port: '3306'
});

exports.query = function (sql:string, arr:any) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err : never, connection: any) {
      if (err) {
        throw err;
      }
      connection.query(sql, arr, function (error: never, result: any) {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
      console.log("released connection")
      pool.releaseConnection(connection);
    });
  })
};

exports.pool = pool;