keytool -genkeypair -v \
  -keystore android/app/keystores/my-release-key.keystore \
  -alias <alias> \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass <sensor> -keypass <sensor>