import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapComponent from './MapComponent';
import ThreeJSScene from './ThreeJSScene'; // This will be your new Three.js component

function App() {
  const [elevationData, setElevationData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/threejs-scene" element={<ThreeJSScene elevationData={elevationData} />} />
        <Route path="/" element={
          <div className="App">
            <h1>Map Drawing and Elevation</h1>
            <MapComponent setElevationData={setElevationData} />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;

