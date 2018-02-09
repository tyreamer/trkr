cd "android/app/src/main/assets/"
del index.android.bundle
del index.android.bundle.meta
cd ../../../../../
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res


