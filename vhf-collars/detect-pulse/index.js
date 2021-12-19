// Testing running SDR4space from within node script (spawning child process)
const { execFile } = require('child_process');
const moment = require('moment');

const timeNow = moment().format('MMMM Do YYYY, h:mm:ss a');
console.log('Time now: ', timeNow);

const child = execFile('./SDR4space-light_x86.AppImage', ['-f', 'index.js'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
// end test