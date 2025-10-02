#!/usr/bin/env bash

. scripts/config.sh

npm version patch --no-git-tag-version

for LIB_PATH in "${LIBS_PATHS[@]}"
do
    cd $LIBS_DIR/${LIB_PATH}
    npm version patch --no-git-tag-version
done
