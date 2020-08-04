const mysql = require('mysql');

const performMysqlQuery = (query, pool) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }

            pool.query(query, (err, rawRows) => {
                if (err) {
                    reject(err);
                }

                const rows = JSON.parse(JSON.stringify(rawRows));

                connection.release();
                resolve(rows);
            });
        });
    });
};

module.exports = performMysqlQuery;
