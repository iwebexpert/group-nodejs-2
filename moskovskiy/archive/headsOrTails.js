const minimist = require('minimist');

const fs = require('fs');

const argv = minimist(process.argv.slice(2), {
    alias: {
        f: 'file'
    }
});

let filename = argv.file;
if (!filename || filename === true || !/^\w+$/.test(filename)) {
    console.log('Неправильное имя файла');
    process.exit(1);
}
filename = './logs/' + filename;

let score = {human: 0, comp: 0}
if (fs.existsSync(filename)) {
    const data = fs.readFileSync(filename, 'utf-8');
    score = JSON.parse(data);
}

gameLoop().then((result) => {
    console.log(`Записываем в лог ${filename} результат:`, result);
    fs.writeFileSync(filename, JSON.stringify(score));
})

async function gameLoop() {
    console.log('Текущий счёт по партиям:', score);
    console.log('Введите число: 1 или 2... Для выхода наберите exit');

    const promise = new Promise((resolve, reject) => {
        const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('line', (cmd) => {
            if (cmd === 'exit') {
                rl.close();
                resolve(score);
            } else {
                if (parseInt(cmd) === 1 || parseInt(cmd) ===2 ) {
                    const compValue = Math.ceil(Math.random()*2);
                    if (parseInt(cmd) === compValue) {
                        score.human++;
                        console.log('Угадал');
                    } else {
                        score.comp++;
                        console.log('Не угадал');
                    }
                } else {
                    console.log('Можно вводить только 1, 2 или exit')
                }
            }
        })
    })
    return await promise;
}
