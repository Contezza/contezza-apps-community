#!/usr/bin/env bash

. scripts/config.sh

rm -rf dist
rm -rf nxcache

for LIB in "${LIBS[@]}"
do
    NODE_OPTIONS="--max-old-space-size=$NODE_MEMORY" ${NG_CLI:-nx} build ${LIB}
done
