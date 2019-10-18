#!/bin/bash

while true
do
  while IFS= read -r domain
  do
    while IFS= read -r path
    do
      echo $domain$path
      ./main.js -d "$domain$path"
      sleep $1
    done < ./links.txt
  done < ./domains.txt
done
