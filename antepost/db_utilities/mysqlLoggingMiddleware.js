const mysql = require('mysql');
const performMysqlQuery = require('./mysqlQuery');
const Differify = require('@netilon/differify');

const loggingMiddleware = async (config, pool) => {
    let diff;
    if (config.oldDocument && config.newDocument) {
        const differefy = new Differify({ mode: { object: 'DIFF', array: 'DIFF' } });
        diff = differefy.compare(config.oldDocument, config.newDocument);
    }

    if (!diff) {
        const queryData = {
            changed_document_id: config.newDocument ? config.newDocument._id : config.oldDocument._id,
            old_value: JSON.stringify(config.oldDocument),
            new_value: JSON.stringify(config.newDocument),
            create_delete: config.isCreated ? 'created' : 'deleted',
            change_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };

        const queryDataFiltered = Object.keys(queryData)
            .filter(key => queryData[key])
            .reduce((obj, key) => {
                obj[key] = queryData[key];
                return obj;
            }, {});

        const keys = Object.keys(queryDataFiltered).join(', ');
        const values = Object.values(queryDataFiltered).map(el => `'${el}'`).join(', ');
        const query = `INSERT INTO tasks_history (${keys}) VALUES (${values})`;
        return await performMysqlQuery(query, pool);
    }

    const changesArr = Object.keys(diff._);
    const results = [];
    for (let i = 0; i < changesArr.length; i++) {
        if (changesArr[i] === '_id' || diff._[changesArr[i]].status === 'EQUAL') {
            continue;
        }

        const queryData = {
            changed_document_id: config.newDocument ? config.newDocument._id : config.oldDocument._id,
            changed_field: changesArr[i],
            old_value: diff._[changesArr[i]].original,
            new_value: diff._[changesArr[i]].current,
            change_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }

        const keys = Object.keys(queryData).join(', ');
        const values = Object.values(queryData).map(el => `'${el}'`).join(', ');
        const query = `INSERT INTO tasks_history (${keys}) VALUES (${values})`;
        results.push(await performMysqlQuery(query, pool));
    }
    return results;
};

module.exports = loggingMiddleware;
