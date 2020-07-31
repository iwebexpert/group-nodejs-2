const mysql = require('mysql');
const config = require('../config.js')

const pool = mysql.createPool(config.db)

class Task {
    static getAll() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err)
                }
                pool.query('SELECT * FROM tasks', (err, rawRows) => {
                    if (err) {
                        reject(err)
                    }
                    const rows = JSON.parse(JSON.stringify(rawRows));
                    connection.release();
                    resolve(rows);
                })

            })
        })
    }
    static changePriority(id, priority) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err)
                }
                pool.query(`UPDATE tasks SET priority = '${priority}' WHERE id = ${id}`, (err, rawRows) => {
                    if (err) {
                        reject(err)
                    }
                    connection.release();
                    resolve({status: 'success'});
                })

            })
        })
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err)
                }
                pool.query(`DELETE FROM tasks WHERE id = ${id}`, (err, rawRows) => {
                    if (err) {
                        reject(err)
                    }
                    connection.release();
                    resolve({status: 'success'});
                })

            })
        })
    }
}

module.exports = Task;