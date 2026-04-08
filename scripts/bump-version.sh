#!/usr/bin/env bash

. scripts/config.sh

npm version patch --no-git-tag-version

for LIB in "${LIBS[@]}"
do
    cd $LIBS_DIR/${LIB}
    npm version patch --no-git-tag-version
done
