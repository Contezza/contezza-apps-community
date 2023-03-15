#!/usr/bin/env bash
. scripts/config.sh

STAGE=$1
echo $STAGE

for LIB_PATH in "${LIBS_PATHS[@]}"
do
    cd $LIBS_DIR/${LIB_PATH}
    npm version ${VERSION_IN_PACKAGE_JSON};
done

echo -e "\n\nBuild projects"
cd ${ROOT_DIR}

npm run build-libs

for LIB in "${LIBS[@]}"
do
    cd $DIST_DIR/${LIB}

    echo -e "======== Publishing library: $LIB ========\n"
    echo -e "npm publish --tag ${VERSION_IN_PACKAGE_JSON}\n"

    npm publish --tag ${VERSION_IN_PACKAGE_JSON}
done
