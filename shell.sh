#!/bin/sh

echo "== ArbitraryComplexit =="
echo
sleep .2

user_name=$(./random-user-id.js)

mkdir -p ./cons
mkfifo "./cons/$user_name-out"
mkfifo "./cons/$user_name-in"

printf "Creating session"
printf '.'
sleep .5
printf '.'
sleep .5
echo '.'


./piper.js ./cons/$user_name-in ./cons/$user_name-out
