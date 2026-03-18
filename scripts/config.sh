#!/usr/bin/env bash

NODE_MEMORY=8192
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..
DIST_DIR=${ROOT_DIR}/dist/@contezza
LIBS_DIR=${ROOT_DIR}/libs
VERSION_IN_PACKAGE_JSON=`node -p "require('$ROOT_DIR/package.json')".version;`;

LIBS=(
    'core'
    'common'
    'js-console'
    'node-browser'
    'dynamic-forms'
    'content-services'
    'profile'
    'process-services'
);

# Library paths in libs folder
# necessary for update library version before publishing
LIBS_PATHS=(
    'core'
    'common'
    'js-console'
    'node-browser'
    'dynamic-forms'
    'content-services'
    'profile'
    'process-services'
);
