const soundEffects = require("node-sound-effects")
const terminalText = require('./terminalText')

exports.init = () => {
    soundEffects.play("upload")
    terminalText.init()
}


// 