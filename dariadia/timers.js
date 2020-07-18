const timerInterval = setInterval(() => {
  console.log("setInterval()");
}, 1000);

//console.log(timerInterval)

//clearInterval(timerInterval) //Также как и в JS

//Очистка таймера Node.js
timerInterval.unref();

//Снова возобновляем таймер
timerInterval.ref();
