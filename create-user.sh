#!/bin/sh

useradd player
passwd player

chshell player -s /home/player/start.sh
