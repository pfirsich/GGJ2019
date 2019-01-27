#!/bin/sh

clear

echo
echo "== Arbitrary Complexity =="
echo
sleep .2

user_name=$(./random-user-id.js)

mkdir -p ./cons
mkfifo "./cons/$user_name-out"
mkfifo "./cons/$user_name-in"

printf "Wating for connection"
printf '.'
sleep .3
printf '.'
sleep .3
echo '.'
sleep .4

./piper.js ./cons/$user_name-in ./cons/$user_name-out
