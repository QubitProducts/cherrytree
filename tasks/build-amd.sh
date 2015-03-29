rm -rf build/amd && \
webpack index.js build/amd/index.js && \
cp README.md build/npm && \
cp package.json build/npm && \
echo "\nthe amd build including deps is\n `bro-size build/amd/index.js`"