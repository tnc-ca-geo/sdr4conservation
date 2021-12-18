# Detecting VHF wildlife tracking collars
Decompose a pre-recorded IQ file into 10 kHz wide channels and attempt to 
detect radio-collar pulses within them.

## Setup and usage

1. Ensure that the latest SDR4space.lite AppImage is installed, and that the 
AppImage is symlinked to this directory. To create the symlink, run:

```bash
$ ln -s [path/to/SDR4space.AppImage] [path/to/this/directory/SDR4space.AppImage]
```

2. Edit `INPUT_FILE` and `INPUT_SR` in `decompose.js` to reflect the path 
to your IQ file and the sample rate at which it was recorded respectively, e.g: 

```javascript
...
var INPUT_FILE_PATH = '/home/nathanielrindlaub/Documents/sample-recordings/gqrx_20211016_120649_166306800_1800000_fc.cf32';
var INPUT_SR = 1.8e6;
...
```

NOTE: the input file must be in .cf32 format.

3. Next, run the following from this directory:

```bash
./SDR4space.AppImage -f index.js
```

The resulting files will appear in your `/tmp/` directory.