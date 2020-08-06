/**
 * Created by ankho on 06.08.2020.
 */

const mysql = require('mysql')

const pool = mysql.createPool({
    host: 'localhost',
    database: 'todo',
    user: 'root',
    password: '',
    connectionLimit: 3,
    waitForConnections: true, //Если своб. соединений в pool нет, то пользователь будет ждать
})

class Task {
    static getAll(){
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if(err){
                    reject(err)
                }

                pool.query('SELECT * FROM tasks', (err, rawRows) => {
                    if(err){
                        reject(err)
                    }

                    console.log(rawRows)
                    const rows = JSON.parse(JSON.stringify(rawRows))

                    connection.release() //Возвращаем соединение обратно в pull
                    resolve(rows)
                })
            })
        })
    }

    static add(task){
        //Реализация
    }
}

module.exports = Task;