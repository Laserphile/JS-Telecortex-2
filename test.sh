#!/bin/bash

virtualenv localpy

source localpy/bin/activate

git clone https://github.com/steinbeck65/fusepy

cd ./fusepy && python ./setup.py install && cd ..

mkdir -p mntpoint

python ./virtual_spi.py ./mntpoint && ./spidev_test -D ./mntpoint/spidev0.0
