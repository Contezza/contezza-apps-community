#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP=${2}

case $1 in
    "build")
        "$DIR"/build.sh "$APP";;
    "ng-build")
        "$DIR"/ng-build.sh "$APP" prod;;
    "inspect")
        "$DIR"/build.sh "$APP" inspect --stats-json; npx webpack-bundle-analyzer dist/"$APP"/stats.json;;
    "ng-inspect")
        "$DIR"/ng-build.sh "$APP" inspect --stats-json; npx webpack-bundle-analyzer dist/"$APP"/stats.json;;
    "start")
        "$DIR"/start.sh "$APP";;
    "prod")
        "$DIR"/start.sh "$APP" "$1";;
esac
