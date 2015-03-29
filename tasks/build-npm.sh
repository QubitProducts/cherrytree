rm -rf build/npm && \
babel -d build/npm/lib ./lib && \
cp README.md build/npm && \
cp index.js build/npm && \
cp package.json build/npm && \
echo "\nthe npm build including deps is\n `bro-size build/npm/index.js`" && \
echo "\nthe npm build excluding deps is\n `bro-size build/npm/index.js -u location-bar -u lodash -u qs -u path-to-regexp -u es6-promise`"