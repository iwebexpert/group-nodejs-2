const fs = require('fs');

const coinFlipAnalyser = () => {
    const filename = process.argv[2];
    try {
        fs.accessSync(filename);
        console.log(`Logs will be analysed from '${filename}'`);
    } catch (err) {
        console.log(`No access to file '${filename}'. Probably file doesn't exist`);
        console.log('Please provide a working logfile path as the first argument');
        return;
    }

    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }

        console.log(analyseData(data));
    })
};

const analyseData = data => {
    dataAsArr = data.split('\n');
    if (!dataAsArr[dataAsArr.length - 1]) {
        dataAsArr.pop();
    }
    dataAsArr = dataAsArr.map(el => el.split(','));

    const analysisResult = {};
    analysisResult.total = dataAsArr.length;

    analysisResult.wonCount = 0;
    for (let i = 0; i < dataAsArr.length; i++) {
        if (dataAsArr[i][1] === 'won') {
            analysisResult.wonCount++;
        }
    }
    analysisResult.lostCount = dataAsArr.length - analysisResult.wonCount;

    analysisResult.maxSequenceWon = 0;
    analysisResult.maxSequenceLost = 0;
    let temp;
    for (let i = 0; i < dataAsArr.length; i++) {
        temp = 0;
        while (dataAsArr[i] && dataAsArr[i][1] === 'won') {
            temp++;
            i++;
        }
        analysisResult.maxSequenceWon = temp > analysisResult.maxSequenceWon ? temp : analysisResult.maxSequenceWon;
    }

    for (let i = 0; i < dataAsArr.length; i++) {
        temp = 0;
        while (dataAsArr[i] && dataAsArr[i][1] === 'lost') {
            temp++;
            i++;
        }
        analysisResult.maxSequenceLost = temp > analysisResult.maxSequenceLost ? temp : analysisResult.maxSequenceLost;
    }

    if (analysisResult.lostCount === 0) {
        analysisResult.wonToLostRatio = 'n/a';
    } else {
        analysisResult.wonToLostRatio = Math.round((analysisResult.wonCount / analysisResult.lostCount + Number.EPSILON) * 100) / 100;
    }

    return analysisResult;
}

coinFlipAnalyser();
