var filename;
var title;
var tempfile;
IO.fdelete('/tmp/index.html');
IO.fdelete('/tmp/plots.html');

function addHeader() {
  print('Header');
  IO.fappend('/tmp/index.html','<!DOCTYPE html><html><head>Channels</head><body>');
  IO.fappend('/tmp/index.html','<p>Full RMS</p>');
  IO.fappend('/tmp/index.html','<img src = "rms_full.png" alt = "Full RMS" width = "1500" height = "400"><br>');
}

function addImage(filename, title) {
	IO.fappend('/tmp/plots.html','<p>' + title + '</p>');
	IO.fappend('/tmp/plots.html','<img src = "'+ filename + '" alt = "Test Image" width = "1500" height = "400"><br>');
}

function createHtml() {
	addHeader();
	var tempfile=IO.fread('/tmp/plots.html');
	IO.fappend('/tmp/index.html', tempfile);
}
