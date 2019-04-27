import React from 'react';
import PasswordlessLogin from './components/PasswordlessLogin';
import './App.css';
import ORE from './js/ore';

function App() {
  const ore = new ORE();

  return (
    <div className="App">
      <header className="App-header">
        <PasswordlessLogin ore={ore} />
      </header>
    </div>
  );
}

export default App;
