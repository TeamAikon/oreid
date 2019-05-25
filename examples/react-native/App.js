import React, { Component } from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import LoginScreen from './components/LoginScreen';

// Navigation
const AppNavigator = createStackNavigator(
  {
    Home: LoginScreen
  },
  {
    initialRouteName: 'Home'
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  render() {
    return <AppContainer />;
  }
}

