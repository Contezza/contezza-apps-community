#!/usr/bin/env bash
. scripts/config.sh

for LIB_PATH in "${LIBS_PATHS[@]}"
do
    echo "Update ${LIB_PATH} version to ${VERSION_IN_PACKAGE_JSON}"

    cd $LIBS_DIR/${LIB_PATH}
#    npm version ${VERSION_IN_PACKAGE_JSON};
    npm version 'latest';
#    npm version preminor;
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
