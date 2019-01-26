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

user_name=$(./random-user-id.js)

mkdir ./cons
mkfifo "./cons/$user_name-out"
mkfifo "./cons/$user_name-in"

echo
sleep .3
echo

echo "Logged in"

cat ./cons/out &
cat /dev/stdin > ./cons/in
