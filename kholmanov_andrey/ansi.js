/**
 * Created by ankho on 21.07.2020.
 */

const ansi = require('ansi')

const cursor = ansi(process.stdout)

cursor
    .white()
    .bg.green()
    .write("Hello world")
    .reset()
    .bg.reset()
    .write('\n')