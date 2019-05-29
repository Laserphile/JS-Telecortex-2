#!/bin/bash

BASE_URL=https://github.com/Laserphile/JS-Telecortex-2/releases/download
RELEASE=v0.1.1-alpha
BINARY=essential-build-artifacts-arm.zip
UNZIPPED_BINARY=essential-build-artifacts-arm

if [[ -e $BINARY ]]
then
  echo "zip file in the way: '$BINARY' remove it."
  exit 1
fi

if [[ -d UNZIPPED_BINARY ]]
then
  echo "folder in the way: '$BINARY' remove it."
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
cp -R $UNZIPPED_BINARY/ node_modules/