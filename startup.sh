#!/bin/bash

while true;
do 
./cli.js -c -h -v -d https://le-dev-b.landsend.com -f links.txt; 
./cli.js -c -h -v -d https://le-int-c.landsend.com -f links.txt; 
./cli.js -c -h -v -d https://le-qas-a.landsend.com -f links.txt; 
./cli.js -c -h -v -d https://www.landsend.com -f links.txt;
./cli.js -c -h -v -p "--chrome-flags=\"--headless --ignore-certificate-errors\"" -d https://le-deva-aws.landsend.com -f links.txt;
sleep 900;
done

