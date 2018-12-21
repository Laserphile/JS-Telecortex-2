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
# Enable SPI in /boot/config.txt
vim /boot/config.txt
# uncomment "dtparam=spi=on"


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

## Install on OSX
```bash
brew install yarn
yarn --ignore-optional install
```
