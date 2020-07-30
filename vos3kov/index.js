const colors = require('colors/safe')
const jzz = require('jzz')
const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B' ]
const port = jzz().openMidiOut().or('Cannot open MIDI Out port!')

notes.forEach((note, index ) =>{
    setTimeout( () => {
        port.noteOn(0,note + '5',127).wait(500).noteOff(0,note + '5');
        process.stdout.write(colors.random(note + ' '))
        },
            index*500
    )})


