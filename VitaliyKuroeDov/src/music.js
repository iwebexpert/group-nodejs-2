const color = require('colors')
const soundEffects = require("node-sound-effects")

exports.init = () => {
    soundEffects.play("upload")
    console.log('LVL UP'.rainbow)


}
