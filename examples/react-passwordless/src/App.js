import React from 'react';
import PasswordlessLogin from './components/PasswordlessLogin';
import './App.css';
import ORE from './js/ore';

function App() {
  const ore = new ORE();

  return (
    <div className="app">
      <div className="app-content">
        <PasswordlessLogin ore={ore} />
      </div>
    </div>
  );
}

export default App;
