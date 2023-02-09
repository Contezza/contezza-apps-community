#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP="$1"
APP_DIR="./apps/$APP"
BRANCH=${ACA_BRANCH:-"3.1.0"}
CONTENT_CE_REPO="https://github.com/Alfresco/alfresco-content-app"
ORIGINAL_CE_DIR=".tmp/original-ce"
APPS_CE_DIR="apps/content-ce"
SETUP_MODE=${2:-"silent"}

function showMessage() {
  local PID="$1"
  local MESSAGE="${2:-Setting up content-ce}"
  local DELAY="0.1"

  while ( kill -0 $PID 2>/dev/null )
    do
      printf "\e[38;5;$((RANDOM%257))m%s\r\e[0m" "$MESSAGE"; sleep "$DELAY"
      printf "\e[38;5;$((RANDOM%257))m%s\r\e[0m" "$MESSAGE"; sleep "$DELAY"
  done
  echo -e "\e[32m✔ \e[0m$MESSAGE complete"
  return 0
}

sleep 1 & showMessage $!

# remove app from dist folder
rm -rf dist/"$APP"

if [ ! -d "$ORIGINAL_CE_DIR" ]  || [ ! -d "$APPS_CE_DIR" ] || [ "$SETUP_MODE" == "force" ]; then
    rm -rf $APPS_CE_DIR
    rm -rf $ORIGINAL_CE_DIR
    mkdir -p .tmp

    echo "Getting ACA: ${BRANCH}"
    git clone -q $CONTENT_CE_REPO --depth=1 --branch $BRANCH .tmp/original-ce
    cp -rf $ORIGINAL_CE_DIR $APPS_CE_DIR

else
    rm -rf $APPS_CE_DIR
    cp -rf $ORIGINAL_CE_DIR $APPS_CE_DIR
fi

# execute all scripts in 'apps/$APP/scripts directory'
if [ -d "$APP_DIR/scripts" ]; then
    for script in "$APP_DIR"/scripts/*.sh; do
        bash "$script" || exit 1
    done
fi

# merge configs
node "$DIR"/merge-translations.js || exit 1; node "$DIR"/merge-app-configs.js "$APP" || exit 1;

kill $PID 2>/dev/null;
