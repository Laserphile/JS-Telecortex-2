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
Follow [this guide](https://styxit.com/2017/03/14/headless-raspberry-setup.html) for instructions to setup up headless ssh over wifi.

### Enable all 4 SPI ports on raspberry pi
(this can be done by editing the file on the SD card, or while the pi is on)
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

### Housekeeping
```bash
# Fresh pi needs update
sudo apt-get update && sudo apt-get upgrade
# Install vim
sudo apt-get install vim
# Install git
sudo apt-get install git
# fix locale
sudo vim /etc/locale.gen
# uncomment the line corresponding to your locale, e.g. en_AU.UTF-8
sudo locale-gen en_AU.UTF-8
sudo update-locale en_AU.UTF-8
# If you have multiple servers, set your hostname to something unique
sudo vim /etc/hostname
```
### Install Node / Yarn

#### 1. Install build tools
```
sudo apt-get install gcc g++ make cmake libopencv-dev
```
#### 2. Install Node
Determine architecture
```
uname -m
```
*If you have an Armv7 or later Pi: (Model 2B, 3\*)*

If you just run `sudo apt-get install nodejs` you will get an old version of node. We want version 11.
```
# install node 11
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
```
*If you have an Armv6 Pi: (Model A, B, Zero)*
May not be possible to install a version of node later than 8 which is required

#### 3. Install yarn
If you just run `sudo apt-get install yarn` you will install [the wrong yarn](http://manpages.ubuntu.com/manpages/xenial/man1/yarn.1.html).
```
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
#### 4. Clone this repo
```
mkdir -p Documents/GitHub
git clone https://github.com/Laserphile/JS-Telecortex-2 Documents/GitHub/JS-Telecortex-2
cd ~/Documents/GitHub/JS-Telecortex-2
```

#### 5. Install JS dependencies

Install the opencv4nodejs npm package manually. This will take a long time.
```bash
npm install --force --save opencv4nodejs@4.16.0
```
Install JS dependencies
In order to stop opencv from re-building every time you change your yarn packages, you must add OPENCV4NODEJS_DISABLE_AUTOBUILD=1 to your environment.
```
OPENCV4NODEJS_DISABLE_AUTOBUILD=1 yarn install
```

## Install on OSX
Install yarn
```bash
brew install yarn
```
Build opencv from source, it takes longer but it means things built in gyp are built with the same c compile that opencv is
```bash
brew install opencv@3 -s
brew unlink opencv
brew link --overwrite opencv@3
```
Smash this in your bashrc/zshrc file:
```bash
export PATH="/usr/local/opt/opencv@3/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/opencv@3/lib"
export CPPFLAGS="-I/usr/local/opt/opencv@3/include"
export PKG_CONFIG_PATH="/usr/local/opt/opencv@3/lib/pkgconfig"
``` 
Make sure your node version is no greater than 11.10.xx
Make sure node-gyp is using the correct node version (errors displayed below will have the node-gyp directory)
Now and try and install...
```
OPENCV4NODEJS_DISABLE_AUTOBUILD=1 yarn install
```
If this doesn't work follow the steps below
```bash
rm -rdf node_modules/opencv4nodejs
rm -rdf node_modules/opencv-build
cp -R essential-build-artifacts/ node_modules/
```

# Usage

#### Run the server (the raspberry pi) in development mode (refreshing on change)

```
yarn dev
```

#### Run the client (your computer) in development mode (refreshing on change)

```
yarn dev-client
```
client options
```
Options:
  --help           Show help                                           [boolean]
  --version        Show version number                                 [boolean]
  --animation, -a  Pick which animation is displayed
        [choices: "singleRainbow", "rainbowFlow", "justBlack", "directRainbows",
                              "directSimplexRainbows", "basicRainbows", "video"]
  --servers        Pick which servers are used
                           [choices: "five", "one-raspberrypi", "one-localhost"]
  --mapping, -m    Pick which mapping is used
                   [choices: "square_serp_12", "square_serp_9", "dome_overhead"]
```
