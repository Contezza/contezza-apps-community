#!/usr/bin/env bash

TAG_NPM=latest

. scripts/config.sh

for LIB_PATH in "${LIBS_PATHS[@]}"
do
    cd $LIBS_DIR/${LIB_PATH}
    npm version prerelease --preid=A;
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
