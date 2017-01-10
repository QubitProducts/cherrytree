rm -rf build

# npm CJS
babel --presets=es2015 -d build/lib ./lib
cp README.md build
cp CHANGELOG.md build
cp index.js build
cp package.json build

# standalone UMD
webpack index.js build/standalone.js

echo "\nnpm build including deps is\n `bro-size build`"
echo "\nnpm build excluding deps is\n `bro-size build -u location-bar -u qs -u path-to-regexp`"
echo "\nstandalone build including deps is\n `bro-size build/standalone.js`"
