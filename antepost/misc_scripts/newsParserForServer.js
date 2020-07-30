const request = require('request');
const cheerio = require('cheerio');
const util = require('util');

const { config } = require('./newsParserConfig');

module.exports = newsParser = async (newsOutlet) => {
    const { urlToParse, parseFunc } = config[newsOutlet];

    const requestPromise = util.promisify(request);

    const newsArr = await requestPromise(urlToParse).then(({ body, statusCode }) => {
        if (statusCode === 200) {
            const $ = cheerio.load(body);
            return parseFunc($);
        } else {
            throw new Error(`Website to parse responded with status code '${statusCode}'`);
        }
    });
    return newsArr;
};
