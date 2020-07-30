const http = require('http')
const urlUtils = require('url')
const requestData = require('request')

const port: number = 3000
const APIKEY: string = 'no money no honey bro'

const requestHandler = (request: any, response: any) => {
    const params = urlUtils.parse(request.url, true).query
    const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${APIKEY}&text=${params.text}&lang=en-ru`
    requestData(url, (err: Error, res: any, body: string) => {
        if (!err && res.statusCode === 200) {
            response.end(JSON.parse(body).text)
        } else {
            const message: string = JSON.parse(body).message
            const addition: string = 'Not translated via Yandex http://translate.yandex.ru'
            response.end(`${message}\n${addition}`)
        }
    })
}

const server = http.createServer(requestHandler)

server.listen(port, (err: Error) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})