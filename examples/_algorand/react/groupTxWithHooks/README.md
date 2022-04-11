
## Overview

This example demonstrates the basics of using the ORE ID
- Initializing the oreid-js library with your app's appId
- Handling the login flow
- Retrieving the user's info from the API
- Composing and signing a blockchain transaction
- Using the LoginButton React component
<br><br>

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)

    yarn start

Runs the app in the development mode.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.


## Using the Dockerfile

Building your container is the first step in running the application.
```shell
# Development 
docker build . -t <dockerhubuser>/oreid-react-dev

# Production
docker build -f ./Dockerfile.prod . -t <dockerhubuser>/oreid-react
```

It is now possible to run the container that was just created and tagged.
```shell
docker run -t <dockerhubuser>/oreid-react(-dev)
```