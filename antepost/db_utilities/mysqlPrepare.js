// If error ER_HOST_NOT_PRIVILEGED is thrown upon creating connection create mysql user with 'any' host (e.g. 'my_user'@'%') and grant him appropriate privileges;

require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true,
});

connection.connect(err => {
    if (err) throw err;

    console.log('connected as id ' + connection.threadId);
});

const query = `
CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB};
USE ${process.env.MYSQL_DB};
CREATE TABLE IF NOT EXISTS tasks_history (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
changed_document_id VARCHAR(24) NOT NULL,
changed_field VARCHAR(255),
old_value LONGTEXT,
new_value LONGTEXT,
create_delete ENUM('created', 'deleted'),
change_date DATETIME NOT NULL
);`;

connection.query(query, (err, results, fields) => {
    if (err) throw err;

    console.log('MySQL successfully prepared');
});

connection.end(err => {
    if (err) throw err;
});
