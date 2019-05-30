#!/usr/bin/env bash

echo "Patching opencv4nodejs..."
cat opencv4node-build-patch.js > node_modules/opencv4nodejs/lib/opencv4nodejs.js
echo "Building..."
npm run build-client