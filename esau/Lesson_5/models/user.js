const config = require('./../config');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
    ...config,
    connectionLimit: 3,
    waitForConnections: true
})

class User {
    tableName = 'users';
    hashRounds = 12;

    constructor() {}

    add(user)
    {
        const salt = bcrypt.genSaltSync(this.hashRounds);

        const record = {
            login: user.login,
            email: user.email,
            password: bcrypt.hashSync(user.password, salt)
        }

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

    findOne(column)
    {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }

                pool.query('SELECT * FROM ' + this.tableName + ' WHERE ?',
                    column,
                    (err, rawData) => {
                        if (err) {
                            reject(err);
                        }

                        if (rawData) {
                            const data = JSON.parse(JSON.stringify(rawData));

                            conn.release();
                            data.length ? resolve(data[0]) : resolve(null);
                        }
                    })
            })
        }));
    }

    validatePassword(candidate, password)
    {
        return bcrypt.compareSync(candidate, password);
    }
}

module.exports = User;