```

  ______________    ________________  ____  _____________  __    ________
 /_  __/ ____/ /   / ____/ ____/ __ \/ __ \/_  __/ ____/ |/ /   /  _/  _/
  / / / __/ / /   / __/ / /   / / / / /_/ / / / / __/  |   /    / / / /
 / / / /___/ /___/ /___/ /___/ /_/ / _, _/ / / / /___ /   |   _/ /_/ /
/_/ /_____/_____/_____/\____/\____/_/ |_| /_/ /_____//_/|_|  /___/___/


```
A rewrite of the [Telecortex](https://github.com/laserphile/telecortex) project in NodeJS which controlls APA102/SK9822 LED strips over OPC

[![Build Status](https://travis-ci.org/Laserphile/JS-Telecortex-2.svg?branch=master)](https://travis-ci.org/Laserphile/JS-Telecortex-2)
[![Maintainability](https://api.codeclimate.com/v1/badges/89eede666d93740400d9/maintainability)](https://codeclimate.com/github/Laserphile/JS-Telecortex-2/maintainability)
[![codecov](https://codecov.io/gh/Laserphile/JS-Telecortex-2/branch/master/graph/badge.svg)](https://codecov.io/gh/Laserphile/JS-Telecortex-2)
[![Known Vulnerabilities](https://snyk.io/test/github/Laserphile/JS-Telecortex-2/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Laserphile/JS-Telecortex-2?targetFile=package.json)

## Gifs!

<img src="img/telecortex-timecrime-djing-short.gif?raw=true"><img src="img/telecortex-inside-dome.gif?raw=true">

## Coverage

![codecoverage-svg-sunburst]( https://codecov.io/gh/Laserphile/JS-Telecortex-2/branch/master/graphs/sunburst.svg)

## Install on Raspbian from scratch
```bash
# Fresh pi needs update
sudo apt-get update && sudo apt-get upgrade
# Install vim
sudo apt-get install vim git
# fix locale
sudo vim /etc/locale.gen
# uncomment the line corresponding to your locale, e.g. en_AU.UTF-8
sudo locale-gen en_AU.UTF-8
sudo update-locale en_AU.UTF-8


# install node 11
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
apt-get install -y nodejs
# Install build tools
sudo apt-get install gcc g++ make
# Install yarn
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
Clone this repo
```
mkdir -p Documents/GitHub
git clone https://github.com/Laserphile/JS-Telecortex-2 Documents/GitHub/JS-Telecortex-2
```
Install JS dependencies
```bash
cd ~/Documents/GitHub/JS-Telecortex-2
yarn install
```

## Enable all 4 SPI ports on raspberry pi

As root, add the lines
```
dtparam=spi=on
dtoverlay=spi1-2cs
```
to `/boot/config.txt` and reboot.
For more options (e.g. 5 SPI devices) and pinouts see `/boot/overlays/README`.

To test, `ls /dev | grep spidev` should show
```
spidev0.0
spidev0.1
spidev1.0
spidev1.1
```

## Install on OSX
```bash
brew install yarn
yarn --ignore-optional install
```
