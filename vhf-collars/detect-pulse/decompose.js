print('decompose.js start');

var INPUT_FILE_PATH = '/home/nathanielrindlaub/Documents/sample-recordings/gqrx_20211016_120649_166306800_1800000_fc.cf32';
var INPUT_SR = 1.8e6;
var NUM_BANDS = 4;
var CENTER_FREQ = 166.3068;
var GNU_PLOT_CMD = {
    'command' : '/usr/bin/gnuplot', 
    'args' : ['./spectrum.gnu']
};

// Initialize IQData object from input file
var o = new IQData('');
if (!o.loadFromFile(INPUT_FILE_PATH)) {
    print('Input file not found!');
    exit();
}
o.setSampleRate(INPUT_SR);
print('\n\nInput file:');
o.dump();

// Assign input IQData object to output 
var samples = o;
samples.setCenterFrequency(CENTER_FREQ);
print('\n\nOutput file:');
samples.dump(); 


// "Decomposing" the input into NUM_BANDS separate channels
// each resulting channel will have SR of the INPUT_SR / NUM_BANDS (450 kS/s here)

// QUESTION: I don't really understand what's happening here. 
// decomposing seems to have the effect of splitting the input along the frequency domain
// into smaller channels, but I don't understand why that is. 
// Does it have to do with Nyquist zones??
// (i.e., resampling at a lower rate will break the input file up into smaller Nyquist Zones,
// and each zone is saved as a new channel?)
var channels = DSP.decompose(samples, NUM_BANDS, 0);
print(channels.length);

for (var z = 0; z < NUM_BANDS; z++) {

    IO.fdelete('/tmp/spectrum.csv');

    // Save channel to /tmp/
    print('Channel : ', z);
    var channel = channels[z];
    channel.dump();
    channel.saveToFile('/tmp/subband_'+ z + '.cs16'); // QUESTON: why .cs16 extension?
    var fileSize = IO.getfsize('/tmp/subband_'+ z + '.cs16');
    print('Channel saved to /tmp/subband_'+ z + '.cs16' + ' -- file size: ' + fileSize);
    print('***********************************');

    // build csv's
    var value = '';
    var spectrum = channel.getPowerSpectrum(4096);  // gets FFT
    for (var a = 0 ; a < spectrum.spectrum.length; a++) {
        value += JSON.stringify(spectrum.frequencies[a]) + ',' + JSON.stringify(spectrum.spectrum[a]) + '\n';
    }
    IO.fappend('/tmp/spectrum.csv', value);
    IO.fappend('/tmp/fullband.csv', value);
    
    // build gnu plot
    var res = System.exec(GNU_PLOT_CMD);
    IO.frename('/tmp/spectrum.png','/tmp/subband_'+ z + '.png');

}

IO.frename('/tmp/fullband.csv','/tmp/spectrum.csv');
var res = System.exec(GNU_PLOT_CMD);
IO.frename('/tmp/spectrum.png','/tmp/fullband_'+ z + '.png');

print('decompose.js end \n');

