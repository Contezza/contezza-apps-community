# Note no #!/bin/sh as this should not spawn
# an extra shell. It's not the end of the world
# to have one, but clearer not to.

show_header() {
    APP=$1;
    ACTION=$2;
    TARGET=$3;

    if [[ $TARGET == *"prod"* ]]; then
        _PROD="\e[32m"
        PROD_="\e[0m"
        PROD_CHECK="✔"
    fi

    if [[ $TARGET == *"inspect"* ]]; then
        _INSPECT="\e[32m"
        INSPECT_="\e[0m"
        INS_CHECK="✔"
    fi

    if [[ $TARGET == "" ]]; then
        _DEV="\e[32m"
        DEV_="\e[0m"
        DEV_CHECK="✔"
    fi

    echo -e "========================================================================"
    echo -e "The $APP application is $ACTION:"
    echo -e "$_PROD""<prod>:                   in production mode     $PROD_CHECK""$PROD_"
    echo -e "$_INSPECT""<inspect>:                in inspect mode     $INS_CHECK""$INSPECT_"
    echo -e "$_DEV""<parameterless>:          in development mode     $DEV_CHECK""$DEV_"
    echo "========================================================================"
}
