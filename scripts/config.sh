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
    'search'
    'third-party'
    'js-console'
    'node-browser'
    'people-group-picker'
    'dynamic-forms'
);

# Library paths in libs folder
# neccessary for update library version before publishing
LIBS_PATHS=(
    'core'
    'common'
    'search'
    'third-party'
    'mgmt/js-console'
    'mgmt/node-browser'
    'people-group-picker'
    'dynamic-forms'
);
