const soundEffects = require("node-sound-effects")
const terminalText = require('./terminalText')

exports.init = () => {
    soundEffects.play("upload")
    terminalText.init()
}


// https://github.com/iwebexpert/group-nodejs-2/pull/1