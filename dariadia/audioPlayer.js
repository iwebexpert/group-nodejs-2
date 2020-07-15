const player = require('play-sound')(opts = {})
const pathToTune = 'music/Retro-style-music-for-video-games-loop.mp3'

console.log('You music is live!')
player.play(pathToTune, function(err){
  if (err) throw err
})

player.play(pathToTune, { afplay: ['-v', 1 ] /* lower volume for afplay on OSX */ }, function(err){
  if (err) throw err
})
