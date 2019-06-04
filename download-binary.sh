#!/bin/bash

BASE_URL=https://github.com/Laserphile/JS-Telecortex-2/releases/download
RELEASE=v0.1.0-alpha
UNZIPPED_BINARY=essential-build-artifacts
BINARY=${UNZIPPED_BINARY}.zip
URL="$BASE_URL/$RELEASE/$BINARY"

download-essential-build-artifacts () {
  echo "Fetching from: $URL"
  wget -q -O ${BINARY} "$URL"
  file ${BINARY}
  chmod a+x ${BINARY}
  unzip -q ${BINARY}
}

copy-essential-build-artifacts () {
  rm -rdf node_modules/opencv4nodejs node_modules/opencv-build
  cp -R essential-build-artifacts/ node_modules/
}

if [[ -d $UNZIPPED_BINARY ]]
then
  echo "folder found"
  copy-essential-build-artifacts
  exit 0
else
  echo "$UNZIPPED_BINARY folder not found"
fi

if [[ -f $BINARY ]]
then
  echo "zip file found"
  set -e
  unzip -q ${BINARY}
  copy-essential-build-artifacts
  exit 0
else
  echo "$BINARY file not found"
fi

download-essential-build-artifacts
copy-essential-build-artifacts
