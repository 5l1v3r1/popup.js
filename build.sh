#!/bin/bash

rm -rf build
mkdir build
jsbuild -license=LICENSE -version=`cat VERSION` -output=build/popup.js -name=popupjs src/*.js
