#GUI output
#set term qt size 1600,600
# output to file
set yrange [-150:0]
set term png size 1200,500
set autoscale
set output "/tmp/spectrum.png"
set datafile separator ","
set timestamp
set grid
plot "/tmp/spectrum.csv" using ($1):2  with lines lt rgb "red"  title 'spectrum'

