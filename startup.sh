#!/bin/bash

domains=("https://www.landsend.com" "https://origin-m1-www.landsend.com" "https://origin-d1-www.landsend.com" "https://le-qas-a.landsend.com" "https://le-int-c.landsend.com")
paths=("/search/S-xea?initialSearch=true&q=fleece" "/shop/womens-sale/S-y5c-ytq-xec?cm_re=lec-_-sale-_-global-_-glbnv-salewomens-_-20180427-_-txt" "/products/womens-fleece-jacket/id_253846?attributes=12323")
#domains=("https://le-int-c.landsend.com")
#paths=("/search/S-xea?initialSearch=true&q=fleece")
while IFS= read -r domain
do
  while IFS= read -r path
  do
    echo $domain$path
    ./main.js -d "$domain$path"
    sleep 10
  done < ./links.txt
done < ./domains.txt

#for domain in "${domains[@]}"
#do
#  :
#  for path in "${paths[@]}"
#  do
#    :
#    echo "$domain$path"
#    ./main.js -d "$domain$path"
#  done
#done


