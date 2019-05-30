#!/usr/bin/env bash

eval "$(ssh-agent -s)"
echo -e $BALENA_CLOUD_KEY > id_rsa
chmod 0600 id_rsa
ssh-add ./id_rsa
cat balenakey >> ~/.ssh/known_hosts
git fetch --unshallow origin
git remote add balena $BALENA_REMOTE
git push -f balena master
