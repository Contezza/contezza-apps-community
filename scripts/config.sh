#!/usr/bin/env bash

NODE_MEMORY=8192
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..
DIST_DIR=${ROOT_DIR}/dist/@contezza
LIBS_DIR=${ROOT_DIR}/libs
VERSION_IN_PACKAGE_JSON=`node -p "require('$ROOT_DIR/package.json')".version;`;
TAG_NPM=latest

LIBS=(
    'core'
    'search'
    'third-party'
    'js-console'
    'node-browser'
);

LIBS_PATHS=(
    'core'
    'search'
    'third-party'
    'mgmt/js-console'
    'mgmt/node-browser'
);
