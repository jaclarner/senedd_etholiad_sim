import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <div className="logo-title">
      <img 
  src={process.env.PUBLIC_URL + '/logo.png'} 
  alt="Senedd Election Simulator Logo" 
  className="logo" 
/>
        <div>
          <h1>Senedd Election Simulator</h1>
          <p>Created by Jac Larner</p>
        </div>
      </div>
    </header>
  );
}

export default Header;