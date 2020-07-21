/**
 * Created by ankho on 21.07.2020.
 */


// ANSI
const ansi = require('ansi')

const cursor = ansi(process.stdout)

cursor
    .white()
    .bg.green()
    .write("Hello world")
    .reset()
    .bg.reset()
    .write('\n');


// COLORS
var colors = require('colors')

console.log('hello world'.underline.red)


// CLI-COLOR
var clc = require("cli-color")

var hello = clc.red
var world = clc.yellow.bold

console.log(hello("Hello") + ' ' + world("world"))