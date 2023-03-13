#!/usr/bin/env bash

. scripts/config.sh

for LIB in "${LIBS[@]}"
do
    NODE_OPTIONS="--max-old-space-size=$NODE_MEMORY" ${NG_CLI:-nx} build ${LIB}
done
