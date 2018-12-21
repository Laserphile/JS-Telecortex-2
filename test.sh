#!/bin/bash

yarn add pi-spi && yarn

virtualenv localpy

source localpy/bin/activate

git clone https://github.com/steinbeck65/fusepy

cd ./fusepy && python ./setup.py install && cd ..

mkdir -p mntpoint

python ./virtual_spi.py ./mntpoint && yarn build && yarn start
