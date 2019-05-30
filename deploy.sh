#!/usr/bin/env bash

git fetch --unshallow origin
grep -v "build" .gitignore > temp && mv temp .gitignore
git remote add balena ${BALENA_REMOTE}
git push -f balena master
