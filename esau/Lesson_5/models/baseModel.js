const config = require('./../config');
const mysql = require('mysql');

const pool = mysql.createPool({
    ...config,
    connectionLimit: 3,
    waitForConnections: true
})

class BaseModel {
    static tableName = '';

    static getAll()
    {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }

                pool.query('SELECT * FROM ' + this.tableName,
                    (err, rawData) => {
                        if (err) {
                            reject(err);
                        }

                        const data = JSON.parse(JSON.stringify(rawData));

                        conn.release();
                        resolve(data);
                    })
            })
        }));
    }

    static add(record)
    {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }

                pool.query('INSERT INTO ' + this.tableName + ' SET ?',
                    record,
                    (err, rawData) => {
                        if (err) {
                            reject(err);
                        }

                        const result = JSON.parse(JSON.stringify(rawData));

                        conn.release();
                        resolve(result.insertId);
                    })
            })
        }));
    }

    static update(id, record)
    {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }

                pool.query(
                    'UPDATE ' + this.tableName + ' SET ? WHERE `id` = ?',
                    [record, id],
                    (err, rawData) => {
                        if (err) {
                            reject(err);
                        }

                        const result = JSON.parse(JSON.stringify(rawData));

                        conn.release();
                        resolve(result.affectedRows);
                    })
            })
        }));
    }

    static delete(id)
    {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }

                pool.query(
                    'DELETE FROM ' + this.tableName + ' WHERE ?',
                    {id},
                    (err, rawData) => {
                        if (err) {
                            reject(err);
                        }

                        const result = JSON.parse(JSON.stringify(rawData));

                        conn.release();
                        resolve(result.affectedRows);
                    })
            })
        }));
    }
}

module.exports = BaseModel;