import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import leafletPip from '@mapbox/leaflet-pip';
import { useNavigate } from 'react-router-dom';
import * as turf from '@turf/turf';



const MapComponent = ({ setElevationData }) => {
  const navigate = useNavigate();
  const [drawnItems, setDrawnItems] = useState(null);

  useEffect(() => {
    if (!document.getElementById('map')._leaflet_id) {
      // Initialize the map
      const map = L.map('map').setView([7.87, 80.77], 8);

      // Add OpenStreetMap layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: false,
      }).addTo(map);

      //removing the water mark
      map.attributionControl.setPrefix('');


      // Initialize the FeatureGroup to store editable layers
      const featureGroup = new L.FeatureGroup();
      map.addLayer(featureGroup);
      setDrawnItems(featureGroup);

      // Initialize the draw control and pass it the FeatureGroup of editable layers
      const drawControl = new L.Control.Draw({
          edit: {
              featureGroup: featureGroup
          }
      });
      map.addControl(drawControl);

      // Event to handle created shapes
      // Event to handle created shapes
    map.on('draw:created', function (e) {
    const layer = e.layer;
    featureGroup.addLayer(layer);
  
    // Calculate area if the layer is a polygon
    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs()[0];
      const area = calculateAreaWithTurf(latLngs);
      console.log(`Area of the drawn shape: ${area} m^2`);
    }
  });
  
    }
  }, []);

  const getElevationData = async (coordinates) => {
    const query = coordinates.map(coord => `${coord.lat},${coord.lng}`).join('|');
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(result => result.elevation);
  };

  const generateGridPoints = (bounds) => {
    const latDiff = bounds._northEast.lat - bounds._southWest.lat;
    const lngDiff = bounds._northEast.lng - bounds._southWest.lng;
    const latStep = latDiff / 9;
    const lngStep = lngDiff / 9;
    const gridPoints = [];


    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const lat = bounds._southWest.lat + i * latStep;
            const lng = bounds._southWest.lng + j * lngStep;
            gridPoints.push({ lat, lng });
        }
    }

    return gridPoints;
  };

  const calculateAreaWithTurf = (latLngs) => {
    const coordinates = latLngs.map(latLng => [latLng.lng, latLng.lat]);
    // Close the ring
    coordinates.push(coordinates[0]);
    
    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    
    return area;
  };

  const isPointInShape = (point, layer) => {
    const gjLayer = L.geoJSON(layer.toGeoJSON());
    return leafletPip.pointInLayer(point, gjLayer, true).length > 0;
  };
  
  const handleGetElevation = async () => {
    if (drawnItems) {
      const layers = drawnItems.getLayers();
      if (layers.length === 0) {
        alert('No shape drawn on the map.');
        return;
      }
  
      const bounds = layers[0].getBounds(); // Assuming only one shape is drawn
      const gridPoints = generateGridPoints(bounds);
  
      try {
        const elevationData = await getElevationData(gridPoints);
       
        
        setElevationData(elevationData); // Store elevation data in state
        // Log the unfiltered elevation data
        console.log('Unfiltered Elevation Data:', elevationData);

        const filteredElevationData = elevationData.map((elevation, index) => {
          const point = L.latLng(gridPoints[index]);
          return isPointInShape(point, layers[0]) ? elevation : 0;
        });
  
        // Log the filtered elevation data
        console.log('Filtered Elevation Data:', filteredElevationData);
        navigate('/threejs-scene');

      } catch (error) {
        console.error('Error fetching elevation data:', error);
      }
    }
    
  };
  

  return (
    <div>
      <div id="map" style={{ height: '600px' }}></div>
      <button id="getElevation" onClick={handleGetElevation}>Get Elevation</button>
    </div>
  );
};

export default MapComponent;
