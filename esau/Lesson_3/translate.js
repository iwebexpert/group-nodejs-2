require('dotenv').config({ path: __dirname + "/../.env" })

const request = require('request')
const readline = require('readline')

const Translater = {
    options: {
        method: 'POST',
        url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
        headers: {
            'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'accept-encoding': 'application/gzip',
            'content-type': 'application/x-www-form-urlencoded',
            useQueryString: true
        },
    },

    setForm(text, from, to) {
        this.options.form = {source: from, q: text, target: to}
    },

    translate(text, from, to) {
        from = from || 'en'
        to = to || 'ru'

        this.setForm(text, from, to)

        return new Promise((resolve, reject) => {
            request(this.options, function (error, response, body) {
                if (error) {
                    reject(error)
                } else {
                    resolve(body)
                }
            })
        })
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getTranslate = async (text) => {
    const body = await Translater.translate(text)

    try {
        const result = JSON.parse(body)

        if (result.data) {
            const variants = result.data.translations;

            console.log(`Исходный текст: "${text}"\nВарианты перевода:`);
            variants.forEach(variant => console.log(`"${variant.translatedText}"`))
        }
    } catch (e) {
        throw e
    }
}

const title = 'Англо-русский транслейтер'
const question = 'Введите фразу: (или "выход" - для выхода)'

console.log(`${title}\n${question}`)

rl.on('line', (answer) => {
    if (answer === 'выход') {
        rl.close();
        return false;
    }

    getTranslate(answer).then(() =>
        console.log(`\n${question}`)
    )
});