// // Testing const & requiring node module:
// const moment = require('moment');
// const timeNow = moment().format('MMMM Do YYYY, h:mm:ss a');
// print('Time now: ', timeNow);
// // end test

load('./decompose.js');
load('./create-html.js');

var INPUT_FILE_PATH = '/tmp/subband_3.cs16';
var INPUT_SR = 450e3;
var CENTER_FREQ = 166.9828;
var RMS_SAMPLE_WIDTH = 150; // Root mean squared (average) sample width
var NUM_CHANNELS = 45;
var PULSE_THRESHOLD = 5; // Pulse detection threshbold (in Db)

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

// setting output samples var to input IQ object (though this isn't actually necessary I think)
var samples = IQ

// build full spectrum FFT csv and chart
var value = '';
var spectrum = samples.getPowerSpectrum(4096); // QUESTION: what is the argument here? It's not in documentation
for (var a = 0; a < spectrum.spectrum.length; a++) {
	value += JSON.stringify(spectrum.frequencies[a]) + ',' + JSON.stringify(spectrum.spectrum[a]) + '\n';
}
IO.fappend('/tmp/spectrum.csv', value);
gnuPlot('spectrum.gnu');
IO.frename('/tmp/spectrum.png','/tmp/spectrum_full.png');

// RMS stands for "Root mean squared" and computes the average value of a continuous waveform
// QUESTION: I don't understand what this does. What is the RMS used for?
// seems like it would just collapse the samples into coarser buckets 
// & average the samples within them to make the data smaller and more managable?
var x = DSP.rmsprofile(samples, RMS_SAMPLE_WIDTH); // QUESTION: What are units is this "window length samples" argument? # of samples? milliseconds?
var n = x.getLength();
var arrayBuffer = new Float32Array(n);
var data = x.getSamples(0, arrayBuffer);
var res_point = RMS_SAMPLE_WIDTH / INPUT_SR; // what is res_point?
for (var i = 1; i < n - 1; i++) {
    IO.fappend('/tmp/rms.csv', (i * res_point * 1000).toFixed(0) + ',' + parseFloat(data[i]));
}
print('Plot res. : ', (res_point * 1000).toFixed(2), ' ms/point');
gnuPlot('rms.gnu');
IO.frename('/tmp/rms.png','/tmp/rms_full.png');
IO.frename('/tmp/rms.csv','/tmp/rms_full.csv');

// Again, decomposing input into more channels
var channels = DSP.decompose(samples, NUM_CHANNELS, 0);
print(channels.length, 'channels');
for (var z = 30; z < 40; z++) { // just saving channels 30 - 39 for now

    IO.fdelete('/tmp/spectrum.csv');

    // Saving channel to csv
    print("Channel : ", z);
    IO.fappend('/tmp/multirms.csv', 'Channel : ' + z);
    var channel = channels[z];
    channel.dump();
    channel.saveToFile('/tmp/channel_'+  z + '.cs16');
    var fileSize = IO.getfsize('/tmp/channel_'+ z + '.cs16');
    print('/tmp/channel_'+ z + '.cs16' + '   :  ' + fileSize);
    print('***********************************');

    var value = '';
    var spectrum = channel.getPowerSpectrum(2048);
    for (var a = 0 ; a < spectrum.spectrum.length; a++) {
        value += JSON.stringify(spectrum.frequencies[a]) + ',' + 
                 JSON.stringify(spectrum.spectrum[a]) + '\n';
    }
    IO.fappend('/tmp/spectrum.csv', value);

    value = ''; // why this
    gnuPlot('spectrum.gnu');
    IO.frename('/tmp/spectrum.png','/tmp/channel_' + z + '.png');
    
    var rms_value = '';
    var x = DSP.rmsprofile(channel, RMS_SAMPLE_WIDTH);
    var n = x.getLength();
    var data = new Float32Array(n);
    x.getSamples(0, data);

    // Detect pulses
    var res_point = (RMS_SAMPLE_WIDTH / INPUT_SR) * NUM_CHANNELS;
    var entered_pulse = false;
    var curr_time = 0;
    var last_pulse_exit = 0;
    var last_pulse_entrance = 0;
    for (var i = 1; i < n - 1; i++) {
        IO.fappend('/tmp/rms.csv', (i * res_point * 1000).toFixed(0) + ',' + parseFloat(data[i]));
        IO.fappend('/tmp/multirms.csv', (i * res_point * 1000).toFixed(0) + ',' + parseFloat(data[i]));
        
        // if we see a > 5 Db INCREASE in power from the last data point, we've entered a pulse
        if ((data[i] - data[i - 1]) > 5 && entered_pulse === false) {
            entered_pulse = true;
            curr_time = i * res_point * 1000;
            last_pulse_entrance = curr_time;
            prev_silence_duration = (curr_time - last_pulse_exit).toFixed(2);
            print('Channel: ', z.toFixed(0), ' - ',
                  (curr_time).toFixed(0), 'ms', ' - ',
                  'ENTERED PULSE', ' - ', 
                  'Last silence length: ', prev_silence_duration, ' ms');
        }

        // if we see a > 5 Db DROP in power, we've exited a pulse
        else if ((data[i - 1] - data[i]) > 5  && entered_pulse === true) {
            entered_pulse = false;
            curr_time = i * res_point * 1000;
            last_pulse_exit = curr_time;
            prev_pulse_duration = (curr_time - last_pulse_entrance).toFixed(2);
            print('Channel: ', z.toFixed(0), ' - ',
                  (curr_time).toFixed(0), 'ms', ' - ',
                  'EXITED PULSE', ' - ',
                  'Last pulse length: ', prev_pulse_duration, ' ms');
        }
    }

    print('Plot res. : ', (res_point * 1000).toFixed(2), ' ms/point');
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
