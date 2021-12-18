datafile = '/tmp/multirms.csv'
#set key outside left autotitle columnhead
set rmargin 23
set key at screen 1, graph 1

#"starttime="`echo $(head -2 doppler.csv | tail -1 - | awk -F "," '{print $1}')`"
#"print starttime
set datafile separator ","
set autoscale
set term png size 1800,4000
set datafile separator ","
set ytics nomirror
set y2tics border
set ytics border
#set ylabel 'Vrappr observateur (km/h)'
#set y2label 'LEVEL' tc lt 2
set yrange [-80:0]
set output "/tmp/multirms.png"
set multiplot layout 12,1
#set autoscale
set xlabel "Time (milliseconds)";

#plot for [i=0:*] datafile index i using 1:2  title columnheader(1)

plot '/tmp/rms_full.csv' using 1:2  pt 7 ps 0.5  lc rgb '#bf000a' title 'Full BW'

#plot for [i=0:*] datafile index i using 1:2  title 'channel'

#plot for [IDX=0:2] datafile index (IDX) using 1:2  title columnheader(1)


#set y2label 'Vrappr' tc lt 2
#plot for [i=0:*] datafile index i using ($1)-starttime:($8)*3.6 with lines axes x1y2 title columnheader(1)
#for [i=0:*] datafile index i using ($1)-starttime:($8)*3.6 with lines lc white axes x1y1 title columnheader(1),
#set output "/www/plots/doppler.png"
#set y2label 'Distance (km)' tc lt 2
set timestamp
#set autoscale
#plot for [i=0:*] datafile index i using ($1)-starttime:8 axes x1y1 with lines title columnheader(1)
#plot for [i=0:*] datafile index i using ($1)-starttime:7 s b with lines axes x1y2 title columnheader(1)
#for [i=0:*] datafile index i using ($1)-starttime:($8)*3.6 with lines axes x1y1 title columnheader(1)

#plot for [i=0:*] datafile index i using 1:2  title columnheader(1)

do for [i=30:39] { 
    cmd = sprintf("ls /tmp/rms_%d.csv", i)
    filelist=system(cmd)
#    set output sprintf("Channel _%d, i)

    title= sprintf("This is the title for plot %d", i)
    plot for [filename in filelist] filename using 1:2  pt 7 ps 0.5  lc rgb '#bf000a' title sprintf("Channel %d", i)
#    plot for [filename in filelist] filename using 1:2 title sprintf("Filename %s", filename)
    
}



unset multiplot