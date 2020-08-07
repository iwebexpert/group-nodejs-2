const config = require('./../config');
const mysql = require('mysql');

const pool = mysql.createPool({
    ...config,
    connectionLimit: 3,
    waitForConnections: true
})

const BaseModel = require('./baseModel');

class News extends BaseModel {
    static tableName = 'news';

    static getById(id)
    {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }

                pool.query('SELECT * FROM ' + this.tableName + ' WHERE ?',
                    {id},
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
}

module.exports = News;