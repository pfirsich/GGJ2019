#!/bin/bash

GREEM='\033[0;32m'
NC='\033[0m'

echo
echo

printf "${GREEM}"

echo "    _______        __     __ __"
echo "   |   _   |.----.|  |--.|__|  |_.----.---.-.----.--.--."
echo "   |       ||   _||  _  ||  |   _|   _|  _  |   _|  |  |"
echo "   |___|___||__|  |_____||__|____|__| |___._|__| |___  |"
echo "                                                 |_____|"
echo "          ______                        __               __ __"
echo "         |      |.-----.--------.-----.|  |.-----.--.--.|__|  |_.--.--."
echo "         |   ---||  _  |        |  _  ||  ||  -__|_   _||  |   _|  |  |"
echo "         |______||_____|__|__|__|   __||__||_____|__.__||__|____|___  |"
echo "                                |__|                            |_____|"

echo
echo

sleep .4

user_name=$(./random-user-id.js)

mkdir -p ./cons
mkfifo "./cons/$user_name-out"
mkfifo "./cons/$user_name-in"

printf "wating for connection"
printf '.'
sleep .3
printf '.'
sleep .3
echo '.'
echo
sleep .6

printf "${NC}"

./piper.js ./cons/$user_name-in ./cons/$user_name-out
