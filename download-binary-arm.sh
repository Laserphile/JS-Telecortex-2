#!/bin/bash

BASE_URL=https://www.dropbox.com/s/svucoqkq6jhmvdz/essential-build-artifacts-arm.zip?dl=1
BINARY=essential-build-artifacts-arm.zip

if [[ -e $BINARY ]]
then
  echo "file in the way: '$BINARY' remove it."
  exit 1
fi

URL="$BASE_URL"

set -e
echo "Fetching from: $URL"
wget -q -O $BINARY "$URL"
file $BINARY
chmod a+x $BINARY
unzip $BINARY
rm -rdf node_modules/opencv4nodejs node_modules/opencv-build
cp -R essential-build-artifacts/ node_modules/
