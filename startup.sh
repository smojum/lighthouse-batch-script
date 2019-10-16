#!/bin/bash

while true;
do 
./cli.js -c -h -v -d https://le-dev-b.landsend.com -f links.txt; 
./cli.js -c -h -v -d https://origin-m1-www.landsend.com -f links.txt;
sleep 900;
done

