import React, { useState } from 'react';
import ShopStatus from './components/ShopStatus'
import Login from './components/Login';

 // Ensure the import path is correct
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <h1>Fair Price Shop Tracker</h1>
          <ShopStatus />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
