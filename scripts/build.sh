#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP=${1}
NODE_MEMORY=8192

. ./scripts/helpers/_show-header.sh

npm config set legacy-peer-deps true

# need to add this when releasing (because of error: node_modules/pdfjs-dist/build/pdf.js does not exist.)
npm install --no-audit --progress=false --prefer-offline

"$DIR"/setup.sh $APP;

# build | inspect app
if [[ "$2" == "inspect" ]]; then
    show_header "$APP" "building" "inspect"
    echo -e "\e[36;3mWarning: inspect uses original ng command, don't expect nx here. See this script for explanation.\e[0m"
    NX_SKIP_TASKS_RUNNER=true NODE_OPTIONS="--max-old-space-size=$NODE_MEMORY" ${NG_CLI:-nx} build "$APP" --configuration production "${@:3}"
else
    show_header "$APP" "building" "production"
    NODE_OPTIONS="--max-old-space-size=$NODE_MEMORY" ${NG_CLI:-nx} build "$APP" --configuration production
    echo -e "---------------------------------------------------------"
    echo -e "\e[32m     BUILD COMPLETE:  $APP\e[0m"
    echo -e "---------------------------------------------------------"
fi
