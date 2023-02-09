#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP=${1}
CE="apps/content-ce"
BRANCH=${ACA_BRANCH:-"v2.6.0"}

# clone aca if content-ce directory not yet exist
if [ ! -d "$CE" ]; then
  cd "${DIR}"/.. &&  echo "Getting ACA: ${BRANCH}" && rm -rf apps/content-ce && \
  git clone https://github.com/Alfresco/alfresco-content-app --depth=1 --branch "${BRANCH}" apps/content-ce
fi

# merge configs
node "$DIR"/merge-translations.js || exit 1; node "$DIR"/merge-angular-configs.js || exit 1; node "$DIR"/merge-app-configs.js "$APP" || exit 1

# run test
ng test "$APP" --browsers=Chrome --watch
