const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    //Запрос 1
    resolve({ name: "Anna", id: 1 });
  }, 1000);
});

promise
  .then(
    (user) => {
      //console.log(user)
      //Запрос 2
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(user); //Через замыкание
          user.colors = ["red", "while", "black"];
          resolve(user);
        }, 1000);
      });
    } //onFulfilled
    //() => {}, //onRejected
  )
  .then((user) => {
    console.log("User со всеми данными:", user);
  });

promise.catch(() => {});

promise.finally(() => {
  console.log("Finally");
});
