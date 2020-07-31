require('dotenv').config();
const mysql = require('mysql');

const establishMysqlConnection = () => {
    console.log('Connecting to MySQL');
    const mysqlPool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DB,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        connectionLimit: 3,
        waitForConnections: true,
    });

    return new Promise((resolve, reject) => {
        mysqlPool.getConnection((err, connection) => {
            if (err) reject(err);

            connection.query('SELECT version();', (err, results, fields) => {
                if (err) reject(err);
                console.log(`Connection to MySQL (version ${JSON.parse(JSON.stringify(results))[0]['version()']}) has been successfully established`);
                connection.release();
                resolve(mysqlPool);
            });
        })
    });
};

module.exports = establishMysqlConnection;
