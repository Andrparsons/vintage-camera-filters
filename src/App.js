import React, { Component } from 'react';
import './App.css';

import Camera from './components/camera'

class App extends Component {
  render() {
    return (
      <div>
        <div className="photobooth">
          
          <div className="controls">
            <p>Controls here</p>
          </div>
          <Camera />
        </div>
      </div>
    );
  }
}

export default App;
