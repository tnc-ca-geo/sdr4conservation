load('./decompose.js');
load('./create-html.js');

var INPUT_FILE_PATH = '/tmp/subband_3.cs16';
var INPUT_SR = 450e3;
var CENTER_FREQ = 166.9828;
var FFT_SIZE = 4096;        // # of bins for FFT. Should be multiple of 2
var RMS_SAMPLE_WIDTH = 150; // # of samples per bin for root mean squared calc
var NUM_CHANNELS = 45;
var PULSE_THRESHOLD = 5;    // Pulse detection threshbold (in Db)

IO.fdelete('/tmp/spectrum.csv');
IO.fdelete('/tmp/rms.csv');
IO.fdelete('/tmp/multirms.csv');

// Create GNU Plot
function gnuPlot(gnuConfigFile) {
  return System.exec({
    'command': '/usr/bin/gnuplot',
    'args': ['./' + gnuConfigFile]
  });
};

// Using subband 3 from decomposition step as input
var IQ = new IQData('');
IQ.setSampleRate(INPUT_SR);
IQ.setCenterFrequency(CENTER_FREQ);
if (!IQ.loadFromFile(INPUT_FILE_PATH)) {
  print('Input file not found !');
  exit();
}

// setting output samples var to input IQ object
// ...though this isn't actually necessary I think
var samples = IQ

// build full spectrum FFT csv and chart
var value = '';
var spectrum = samples.getPowerSpectrum(FFT_SIZE);
for (var a = 0; a < spectrum.spectrum.length; a++) {
	value += JSON.stringify(spectrum.frequencies[a]) + ',' + 
           JSON.stringify(spectrum.spectrum[a]) + '\n';
}
IO.fappend('/tmp/spectrum.csv', value);
gnuPlot('spectrum.gnu');
IO.frename('/tmp/spectrum.png','/tmp/spectrum_full.png');

// RMS stands for "Root mean squared" 
// and computes the average value of a continuous waveform.
// Essentially, we are just collapsing the samples into coarser buckets 
// & average the samples within them to compress the data smaller
var x = DSP.rmsprofile(samples, RMS_SAMPLE_WIDTH);
var n = x.getLength();
var arrayBuffer = new Float32Array(n);
var data = x.getSamples(0, arrayBuffer);
// resPoint is the # samples per RMS bin / SR, i.e., the duration of each bin
var resPoint = RMS_SAMPLE_WIDTH / INPUT_SR;
for (var i = 1; i < n - 1; i++) {
  var currTime = i * resPoint * 1000;
  IO.fappend('/tmp/rms.csv', (currTime).toFixed(0) + ',' + parseFloat(data[i]));
}
print('Plot res. : ', (resPoint * 1000).toFixed(2), ' ms/point');
gnuPlot('rms.gnu');
IO.frename('/tmp/rms.png','/tmp/rms_full.png');
IO.frename('/tmp/rms.csv','/tmp/rms_full.csv');

// Again, decomposing input into more channels
var channels = DSP.decompose(samples, NUM_CHANNELS, 0);
print(channels.length, 'channels');
for (var z = 30; z < 40; z++) { // just saving channels 30 - 39 for now

  IO.fdelete('/tmp/spectrum.csv');

  // save channel
  print("Channel : ", z);
  IO.fappend('/tmp/multirms.csv', 'Channel : ' + z);
  var channel = channels[z];
  channel.dump();
  channel.saveToFile('/tmp/channel_'+  z + '.cs16');
  var fileSize = IO.getfsize('/tmp/channel_'+ z + '.cs16');
  print('/tmp/channel_'+ z + '.cs16' + '   :  ' + fileSize);
  print('***********************************');

    // build channel FFT csv and chart
  var value = '';
  var spectrum = channel.getPowerSpectrum(2048);
  for (var a = 0 ; a < spectrum.spectrum.length; a++) {
    value += JSON.stringify(spectrum.frequencies[a]) + ',' + 
              JSON.stringify(spectrum.spectrum[a]) + '\n';
  }
  IO.fappend('/tmp/spectrum.csv', value);
  gnuPlot('spectrum.gnu');
  IO.frename('/tmp/spectrum.png','/tmp/channel_' + z + '.png');
  
  // compress data w/ RMS
  var x = DSP.rmsprofile(channel, RMS_SAMPLE_WIDTH);
  var n = x.getLength();
  var data = new Float32Array(n);
  x.getSamples(0, data);

  // Detect pulses
  var resPoint = (RMS_SAMPLE_WIDTH / INPUT_SR) * NUM_CHANNELS;
  var enteredPulse = false;
  var currTime = 0;
  var lastPulseExit = 0;
  var lastPulseEntrance = 0;
  for (var i = 1; i < n - 1; i++) {
    currTime = i * resPoint * 1000;

    // append data point to CSVs
    var row = (currTime).toFixed(0) + ',' + parseFloat(data[i]);
    IO.fappend('/tmp/rms.csv', row);
    IO.fappend('/tmp/multirms.csv', row);
    
    // if we see a > 5 Db INCREASE in power from the last data point, 
    // we've entered a pulse
    if ((data[i] - data[i - 1]) > 5 && enteredPulse === false) {
      enteredPulse = true;
      lastPulseEntrance = currTime;
      prevSilenceDuration = (currTime - lastPulseExit).toFixed(2);
      print('Channel: ', z.toFixed(0), ' - ',
            (currTime).toFixed(0), 'ms', ' - ',
            'ENTERED PULSE', ' - ', 
            'Last silence length: ', prevSilenceDuration, ' ms');
    }

    // if we see a > 5 Db DROP in power since last data point, 
    // we've exited a pulse
    else if ((data[i - 1] - data[i]) > 5  && enteredPulse === true) {
      enteredPulse = false;
      lastPulseExit = currTime;
      prevPulseDuration = (currTime - lastPulseEntrance).toFixed(2);
      print('Channel: ', z.toFixed(0), ' - ',
            (currTime).toFixed(0), 'ms', ' - ',
            'EXITED PULSE', ' - ',
            'Last pulse length: ', prevPulseDuration, ' ms');
    }
  }

  print('Plot res. : ', (resPoint * 1000).toFixed(2), ' ms/point');
  gnuPlot('rms.gnu');
  sleep(1000);
  addImage('rms_'+ z + '.png', 'Channel : ' + z + '  -  Freq ' + channel.getCenterFrequency().toFixed(4) + ' MHz :');
  IO.frename('/tmp/rms.png','/tmp/rms_'+ z + '.png');
  IO.frename('/tmp/rms.csv','/tmp/rms_'+ z + '.csv');
  IO.fappend('/tmp/multirms.csv','\n');
}

gnuPlot('multirms.gnu');

IO.fdelete('/tmp/rms.csv');
createHtml();

print('relay_collar_clean.js end');
