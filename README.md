# Luctor (apk)

Luctor Solutions

## Make APK
"c:\Program Files\Java\jdk1.8.0_152\bin\keytool.exe" -genkey -v -keystore key.keystore -alias getcoord -keyalg RSA -keysize 2048 -validity 20000

"c:\Program Files\Java\jdk1.8.0_152\bin\jarsigner.exe" -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore key.keystore coord.apk getcoord

c:\Users\aramirez\AppData\Local\Android\Sdk\build-tools\29.0.3\zipalign.exe -v 4 coord.apk getcoord.apk

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
