#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP=${1}
NODE_MEMORY=8192

npm config set legacy-peer-deps true

# need to add this when releasing (because of error: node_modules/pdfjs-dist/build/pdf.js does not exist.)
npm install --no-audit --progress=false --prefer-offline

# build | inspect app
if [[ "$2" == "inspect" ]]; then
    NX_SKIP_TASKS_RUNNER=true node --max_old_space_size=$NODE_MEMORY ./node_modules/@angular/cli/bin/ng build "$APP" --prod "${@:3}"
else
    node --max_old_space_size=$NODE_MEMORY ./node_modules/@angular/cli/bin/ng build "$APP" --prod "${@:3}"

    echo -e "---------------------------------------------------------"
    echo -e "\e[32m     BUILD COMPLETE:  $APP\e[0m"
    echo -e "---------------------------------------------------------"

fi
