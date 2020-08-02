const nodeMailer = require("nodemailer");
const SMTPTransport = require("nodemailer/lib/smtp-transport");

// конфигурация письма
const smtpConfig = nodeMailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false, // если ставить true (в production) выставляется порт 465
  auth: {
    user: "userName@mail.com",
    password: "***",
  },
});

// описываем от кого письмо
smtpConfig.sendMail(
  {
    from: "User <userName@mail.com>", // эта почта должна совпадать с user (st.9)
    to: "someAnotherRecipient@anotherMail.com",
    subject: "Тестовое письмо", // тема письма
    text: "Проверка работы почты!",
    html: "<h1>Проверка работы почты!</h1>",
  },
  (err, info) => {
    if (err) {
      throw err;
    }

    console.log("Письмо успешно отправлено!", info);
    smtpConfig.close(); // закрываем соединение
  }
);
