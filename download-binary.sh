#!/bin/bash

BASE_URL=https://github.com/Laserphile/JS-Telecortex-2/releases/download
RELEASE=v0.1.0-alpha
BINARY=essential-build-artifacts.zip

if [[ -e $BINARY ]]
then
  echo "file in the way: '$BINARY' remove it."
  exit 1
fi

URL="$BASE_URL/$RELEASE/$BINARY"

set -e
echo "Fetching from: $URL"
wget -q -O $BINARY "$URL"
file $BINARY
chmod a+x $BINARY
unzip -q $BINARY
rm -rdf node_modules/opencv4nodejs node_modules/opencv-build
cp -R essential-build-artifacts/ node_modules/