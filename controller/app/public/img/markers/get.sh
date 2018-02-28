#!/bin/bash
for i in {1..30}; do
    base='https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red'
    sufix='.png'
    url=$base$i$sufix
    wget $url
done