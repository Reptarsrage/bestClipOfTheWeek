# publish uysing dotnet
dotnet publish "./src/BestClipOfTheWeek/BestClipOfTheWeek.csproj" -o "./publish" -c "Release"

# copy files using SCP
scp -r -i "C:\my keys\raspberrrypi-openssh" "./publish" "pi@192.168.0.10:~/publish_bcotw_swap"
scp -r -i "C:\my keys\raspberrrypi-openssh" "./src/BestClipOfTheWeek/Database.sqlite" "pi@192.168.0.10:~/publish_bcotw_swap"

# swap with old files
ssh -i "C:\my keys\raspberrrypi-openssh" "pi@192.168.0.10" "'mv' /home/pi/publish_bcotw /home/pi/publish_bcotw_old && 'mv' /home/pi/publish_bcotw_swap /home/pi/publish_bcotw"

# restart Kestral
ssh -i "C:\my keys\raspberrrypi-openssh" "pi@192.168.0.10" "sudo systemctl restart kestrel-bcotw.service"

# remove swap dir
ssh -i "C:\my keys\raspberrrypi-openssh" "pi@192.168.0.10" "'rm' -rf /home/pi/publish_bcotw_old"
