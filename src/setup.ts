const db = require("./db");

(async function run() {
    console.log("Database Table Creating ... ");

    var sqlCommand = `
    CREATE TABLE IF NOT EXISTS key_events (
    id int(10) NOT NULL auto_increment,
    track_id int(10) NOT NULL,
    address varchar(100) NOT NULL,
    location varchar(100) NOT NULL,
    temperature float(30) NOT NULL,
    device varchar(100) NOT NULL,
    updated_time datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
    );
    `

    await db.query(
        sqlCommand, []
    );

    sqlCommand = `
    CREATE TABLE IF NOT EXISTS hashed_certificates (
    id int(10) NOT NULL auto_increment,
    address varchar(100) NOT NULL,
    certification MEDIUMTEXT NOT NULL,
    updated_time datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
    );
    `

    await db.query(
        sqlCommand, []
    );

    console.log("Database Tables Created ");

    process.exit();
})();