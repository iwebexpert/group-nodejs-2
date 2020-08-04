const mysql = require("mysql");

// Вариант 1 (устаревший) Передаем настройки для входа в БД
// const connection = mysql.createConnection({
//   host: "localhost",
//   database: "todo",
//   user: "root",
//   password: "123456",
// });

// connection.connect((err) => {
//   connection.query(""); // в запросе идет код mysql
// });

// Вариант 2
const pool = mysql.createPool({
  host: "localhost",
  database: "todo",
  user: "root",
  password: "1234",
  connectionLimit: 3, // сколько клиентов одновременно могут подключиться к бд
  waitForConnections: true, // если свободных соединений в pool нет, то пользователь будет ждать, по умолчанию false
});

class Task {
  static getAll() {
    return new Promise((resolve, reject) => {
      // устанавливаем соединение
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }

        // Запрос
        pool.query("SELECT * FROM tasks", (err, rawRows) => {
          if (err) {
            reject(err);
          }
          const rows = JSON.parse(JSON.stringify(rawRows));
          connection.release; // Возвращаем соединение обратно в pool
          resolve(rows);
        });
      });
    });
  }

  static add(task) {
    // реализация
  }
}

module.exports = Task;
