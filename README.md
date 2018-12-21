## Install on Raspbian
```bash
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
In the root directory of this repository:
```bash
# install JS dependencies
yarn install
```

## Install on OSX
```bash
brew install yarn
yarn --ignore-optional install
```
