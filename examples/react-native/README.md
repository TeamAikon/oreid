# React Native Mobile App Example

A simple React Native example that demonstrates use of the oreid-js and provides a reusable webview component. This example was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

To run sample code:

- You'll need your App ID and API Key - you get them when you register your app with ORE ID
- Populate .env file in root of project directory (copy .env.example.json to examples/react-native/.env.json)

    ```
    cd examples/react-native
    npm install
    ```

### `npm start`

Opens your app in the [Expo app](https://expo.io) on your phone.

#### `npm run ios`

Like `npm start`, but also attempts to open your app in the iOS Simulator if you're on a Mac and have it installed.

#### `npm run android`

Like `npm start`, but also attempts to open your app on a connected Android device or emulator. Requires an installation of Android build tools (see [React Native docs](https://facebook.github.io/react-native/docs/getting-started.html) for detailed setup).