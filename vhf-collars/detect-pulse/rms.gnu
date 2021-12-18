#set term qt size 1800,500
set term png size 1800,500
set output "/tmp/rms.png"
set datafile separator ","
#localtime=date +%z
#set format x "%H:%M:%S% \n %d/%m "
#set title "id : " . sprintf("%d", id)
#set xrange ["2019/06/14 12:00:00":"2019/06/14 21:00:00"]
set xlabel " Time (ms)"
set autoscale 
set timestamp
#set xrange [0:2000]
set yrange [-70:-5]
#set xdata time
#set grid
#set key left
#set y2range [0:100]
#set y2tics border tc lt 2
#set y2label 'Humidity' tc rgb "#009e73"
#set ylabel 'Temp degC' tc rgb "#bf000a"
#set ytics nomirror tc rgb "#bf000a"
#set y2tics nomirror
#set ytics border
#plot 'id161.csv' using ($1)+$timezone_offset:3 lc rgb '#bf000a title '', 'id161.csv' using 1:3 s b lc rgb '#2e4053'
plot '/tmp/rms.csv' using 1:($2) pt 7 ps 0.5  lc rgb '#bf000a' title 'level'
#set term png size 1800,500
#set output "/tmp/rms.png"
#set xrange [0:200]
#plot '/tmp/rms.csv' using 1:($2) pt 7 ps 0.5  lc rgb '#bf000a' title 'level'
#pause -1
