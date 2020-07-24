const nodemailer = require("nodemailer");

const smtpConfig = nodemailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false, //465
  auth: {
    user: "username@mail.colaldomain",
    pass: "***",
  },
});

smtpConfig.sendMail(
  {
    from: "User <username@mail.colaldomain>",
    to: "anna-ivanova@localdomain.local",
    subject: "Тестовое письмо",
    text: "Привет! Проверка работы почты",
    html: "<h1>Привет! Проверка работы почты</h1>",
  },
  (err, info) => {
    if (err) {
      throw err;
    }

    console.log("Письмо успешно было отправлено!", info);
    smtpConfig.close();
  }
);
