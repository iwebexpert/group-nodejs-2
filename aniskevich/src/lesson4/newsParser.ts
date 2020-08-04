const request = require('request')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')

type Entity = {
    id: number
    title: string
    body: string
    image: string
}

type Options = {
    title: string
    body: string
    image: string
    count: number | string
}

module.exports = class newsParser {
    constructor(url: string) {
        this.url = url
        this.data = []
    }

    private url: string
    private data: Array<Entity>

    private decode(data: string): string {
        return iconv.encode(iconv.decode(Buffer.from(data, 'binary'), 'win1251'), 'utf-8').toString()
    }

    public parse() {
        return new Promise((resolve, reject) => {
            request({
                uri: this.url,
                method: 'GET',
                encoding: 'binary'
            }, (err: Error, res: any, body: string) => {
                if (!err && res.statusCode === 200) {
                    const $ = cheerio.load(body)
                    $('.story-list__item-content').each((id: number, el: string) => {
                        const title = this.decode($(el).find('h3 a').text())
                        const body = this.decode($(el).find('p a').text())
                        const image = $(el).find('a img').attr('src')
                        this.data.push({id, title, body, image})             
                    })
                }
                resolve()
            })
        })
    }

    public getData(options: any): Array<Entity> {
        let { count, ...rest } = options
        if (!count || count < 1) count = 10
        const data = this.data.filter(entity => {
            return entity.id < +count
        }).map((entity: any) => {
            for (const key of Object.keys(entity)) {
                if (!(key in rest) || rest[key] === 'off') delete entity[key]
            }
            return entity
        })
        return data
    }
}