#!/bin/bash

BASE_URL=https://github.com/Laserphile/JS-Telecortex-2/releases/download
RELEASE=v0.1.2-alpha
UNZIPPED_BINARY=essential-build-artifacts-arm
BINARY=${UNZIPPED_BINARY}.zip

rm -rdf ${UNZIPPED_BINARY}
rm -rdf ${BINARY}

if [[ -f ${BINARY} ]]
then
  echo "zip file found"
  unzip -q ${BINARY}
  rm -rdf node_modules/pi-spi
  cp -R ${UNZIPPED_BINARY}/ node_modules/
  exit 0
else
  echo "$BINARY file not found"
fi

if [[ -d ${UNZIPPED_BINARY} ]]
then
  echo "folder found"
  rm -rdf node_modules/pi-spi
  cp -R ${UNZIPPED_BINARY}/ node_modules/
  exit 0
else
  echo "$UNZIPPED_BINARY folder not found"
fi

URL="$BASE_URL/$RELEASE/$BINARY"

set -e
echo "Fetching from: $URL"
wget -q -O ${BINARY} "$URL"
file ${BINARY}
chmod a+x ${BINARY}
unzip -q ${BINARY}
rm -rdf node_modules/pi-spi
cp -R ${UNZIPPED_BINARY}/ node_modules/
