#!/bin/sh

echo "== ArbitraryComplexit =="
echo
# sleep .6

printf "Creating session"
printf '.'
# sleep .5
printf '.'
# sleep .5
printf '.'

user_name=$(./random-user-id.js)

mkdir -p ./cons
mkfifo "./cons/$user_name-out"
mkfifo "./cons/$user_name-in"

echo
# sleep .4
echo

echo "Logged in"

cat ./cons/$user_name-out &
./piper.js ./cons/$user_name-in
