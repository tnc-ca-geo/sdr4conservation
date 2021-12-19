// Testing running SDR4space from within node script (spawning child process)
const { execFile } = require('child_process');
const moment = require('moment');

// testing including NPM package
const timeNow = moment().format('MMMM Do YYYY, h:mm:ss a');
console.log('Time now: ', timeNow);

// Spawn child process
const file = './SDR4space-light_x86.AppImage';
const args = ['-f', 'detect-pulse.js'];
const child = execFile(file, args, (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
