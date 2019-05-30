#!/usr/bin/env bash

echo "Patching opencv4nodejs..."
cat opencv4node-build-patch.js > node_modules/opencv4nodejs/lib/opencv4nodejs.js
echo "Building..."
npm run build
echo "Build complete cleaning up..."
mv node_modules node_modules-old
mkdir node_modules
cp -R node_modules-old/opencv-build node_modules/
cp -R node_modules-old/opencv4nodejs node_modules/
rm -rdf node_modules-old coverage docs .circleci img src test_data test_scripts
find . -type f -not -name 'build' -not -name 'node_modules' -delete