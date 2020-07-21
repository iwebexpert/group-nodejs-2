const inputFile = require('minimist')(process.argv.slice(2))._[0]
const fs = require('fs')
const defaultFileName = 'games.log'
const filename = inputFile ? inputFile : defaultFileName

check = (smbl, str) => {
    let cnt = 0, max = 0
    for (let i = 0; i < str.length; i++){
        if (smbl == str[i]){
            cnt++
            cnt > max ? max = cnt : null
        }else{
            cnt = 0
        }
    }
    return +max
}

fs.readFile(filename,  { encoding: 'utf8' } , (err, data) => {
    if (err) {
        throw err
    }

    let results = data.toString()
    console.log('Всего сыграно ', results.length, ' партий')
    console.log('Проигрышей ', results.match(/[0]/g).length, '/ Выигрышей ',results.match(/[1]/g).length)
    console.log('Максимум проигрышей подряд ', check(0, results))
    console.log('Максимум выигрышей подряд ', check(1, results))

})




