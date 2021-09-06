import { resolve } from "path/posix";

const mysql = require("mysql");

let pool = mysql.createPool({
  host: '35.244.***.32',
	user: 'root',
	password: '******',
	database: 'baby_formula',
	port: '3306'
});

exports.query = function (sql:string, arr:any) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err : never, connection: any) {
      if (err) {
        throw err;
      }
      // console.log("connection query:", sql, "using" ,arr)
      connection.query(sql, arr, function (error: never, result: any) {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
      pool.releaseConnection(connection);
    });
  })
};

exports.pool = pool;
