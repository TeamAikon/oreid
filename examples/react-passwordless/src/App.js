import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import PasswordlessLogin from './components/PasswordlessLogin';
import './App.scss';
import ORE from './js/ore';

function App() {
  const model = useLocalStore(() => ({
    results: '',
    userInfo: {},
    isLoggedIn: false,
  }));

  const ore = new ORE(model);

  return (
    <div className="app">
      <div className="app-content">
        <PasswordlessLogin ore={ore} model={model} />
      </div>
    </div>
  );
}

export default App;
