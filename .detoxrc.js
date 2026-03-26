module.exports = {
  testRunner: "jest",
  runnerConfig: "e2e/jest.config.js",
  specs: "e2e/**/*.test.ts",
  behavior: {
    init: {
      reinstallApp: true,
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        id: "iPhone 15",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        id: "pixel_5",
      },
    },
  },
  apps: {
    ios: {
      type: "ios",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/LaPape.app",
      build:
        "xcodebuild -workspace ios/LaPape.xcworkspace -scheme LaPape -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    },
    android: {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug",
    },
  },
};
