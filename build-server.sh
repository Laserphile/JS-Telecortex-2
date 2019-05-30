#!/usr/bin/env bash

echo "Building..."
cat pi-spi-build-patch.js > node_modules/pi-spi/index.js
npm run build-server
#echo "Build complete cleaning up..."
#mv node_modules node_modules-old
#mkdir node_modules
#cp -R node_modules-old/pi-spi node_modules/
#find . -type f -not -name 'build' -not -name 'node_modules' -delete