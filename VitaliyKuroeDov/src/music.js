const soundEffects = require("node-sound-effects")
const terminalText = require('./terminalText')

exports.init = (text) => {
    soundEffects.play("upload")
    terminalText.init(text)
}


// 