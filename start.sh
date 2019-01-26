#!/bin/sh

echo "== ArbitraryComplexit =="
echo
sleep .6

printf "Creating session"
printf '.'
sleep .5
printf '.'
sleep .5
printf '.'

rm -r ./cons
mkdir ./cons
mkfifo ./cons/out
mkfifo ./cons/in

echo
sleep .8
echo

node ./main.js &

echo "Logged in"

cat ./cons/out &
cat /dev/stdin > ./cons/in
