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

## RaspberryPi Setup
Sign up for [BalenaCloud](https://www.balena.io/cloud/) and set up an application. Use its wizard to make an image with 
your network details. 

Or you can download and configure your own image as long as it runs docker. Head over to https://www.balena.io/os/#download and get yourself a BalenaOS image.

Once the Pi(s) is running you can push an image to it by following the instructions [below](#balena-dev-setup)

## OSX setup
There are many ways to scream in frustration about opencv4nodejs. But this is my favorite way.

Make sure your Node version is shit. My favorite outdated version is `v11.15.0`. Anything newer and you are in the *_\*DANGER ZONE\*_*.

Make sure opencv is *not* installed. Seriously, I spent days on this and only a pristine slate worked for me.
- `brew uninstall opencv opencv@2 opencv@3`
- `brew uninstall ffmpeg tesseract`

Install yarn `brew install yarn`

Now you can run `yarn`. It will hide the build output, but be patient and it should work.
IF you are stuck on this for ages its a good thing:
```
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
[1/10] ⠄ opencv-build
[-/10] ⠄ waiting...
[-/10] ⠄ waiting...
[-/10] ⡀ waiting...
[-/10] ⡀ waiting...
```
### You lied and it still fails to build
Try this: ¯\\\_(ツ)\_/¯
```bash
yarn --ignore-scripts
./download-binary.sh
```

### Balena dev setup
If you want to push to your pi without going through the pipeline. Make sure you also "enable local mode" on BalenaCloud if its a cloud image.
- `npm install --global --production --unsafe-perm balena-cli`
- `sudo balena local scan`
Get the ip address of the device you want to push to from the output.
- `sudo balena push 192.168.1.120` or whatever the IP is.

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