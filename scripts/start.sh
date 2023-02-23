#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP=${1}
NODE_MEMORY=8192
NODE_MODULES_DIR="node_modules"
INSTALL_NM_MESSAGE="Installing node modules"

if [ "$2" == "prod" ]; then
    # start in prod mode
    NODE_OPTIONS=--max_old_space_size=$NODE_MEMORY ${NG_CLI:-nx} serve "$APP" --configuration production --watch false
else
    # start in development mode

    if [ ! -d "$NODE_MODULES_DIR" ] ; then
        echo -e "⌛ $INSTALL_NM_MESSAGE ..."
        npm install --no-audit --progress=false --prefer-offline
        echo -e "\e[32m✔ \e[0m$INSTALL_NM_MESSAGE complete."
    fi

    NODE_OPTIONS=--max_old_space_size=$NODE_MEMORY ${NG_CLI:-nx} serve "$APP"
fi
