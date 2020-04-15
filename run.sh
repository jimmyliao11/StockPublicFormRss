#!/bin/bash

cd "$(dirname "$0")"
pwd

cp stock-public-form.xml stock-public-form.xml.old

node index.js

old_data=$(grep -o '<item><title>.*</title>' stock-public-form.xml.old)
new_data=$(grep -o '<item><title>.*</title>' stock-public-form.xml)

if [ "$old_data" == "$new_data" ]; then
    echo match
else
    echo not match
    timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    message="publish at $timestamp"
    git add stock-public-form.xml
    git commit --allow-empty-message -m "${message}"
    git push origin gh-pages
fi

exit 0
