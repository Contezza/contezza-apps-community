#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..
DIST_DIR=${ROOT_DIR}/dist/@contezza
LIBS_DIR=${ROOT_DIR}/libs
VERSION_IN_PACKAGE_JSON=`node -p "require('$ROOT_DIR/package.json')".version;`;
TAG_NPM=latest

LIBS=(
    'core'
    'third-party'
);

for LIB in "${LIBS[@]}"
do
    echo "Update ${LIB} version to ${VERSION_IN_PACKAGE_JSON}"

    cd LIBS_DIR/${LIB}
    npm version ${VERSION_IN_PACKAGE_JSON};
done

echo -e "\n\nBuild projects"
cd ${ROOT_DIR}

npm run build-libs

for LIB in "${LIBS[@]}"
do
    cd $DIST_DIR/${LIB}

    echo -e "======== Publishing library: $LIB ========\n"
    echo -e "npm publish --tag $TAG_NPM\n"

    npm publish --tag $TAG_NPM
done
