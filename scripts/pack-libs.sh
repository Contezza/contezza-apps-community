#!/usr/bin/env bash

. scripts/config.sh

for LIB in "${LIBS[@]}"
do
    cd ${DIST_DIR}/${LIB}
    npm pack --pack-destination $ROOT_DIR
done
