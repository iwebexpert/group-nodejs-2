const BaseModel = require('./baseModel');

class News extends BaseModel {
    static tableName = 'news';
}

module.exports = News;