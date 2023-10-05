import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeJSScene = ({ elevationData }) => {  // Don't forget to pass elevationData as a prop
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    
    // Initialize scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      container.clientWidth / -2,
      container.clientWidth / 2,
      container.clientHeight / 2,
      container.clientHeight / -2,
      1,
      1000
    );
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Append renderer to container
    container.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Create geometry
    const geometry = new THREE.PlaneGeometry(300, 300, 9, 9);

    // Modify z-positions based on elevation data
    console.log("to create terrain",elevationData);
    if (elevationData) {
        const positions = geometry.getAttribute('position').array;
        for (let i = 0; i < elevationData.length; i++) {
          positions[i * 3 + 2] = elevationData[i]; // i * 3 + 2 because each vertex is represented by x, y, z
        }
        geometry.getAttribute('position').needsUpdate = true; // Flag to update the geometry
      }
    // Create material
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00, wireframe: true });  // Using Phong material with wireframe

    // Create mesh and add to scene
    const terrain = new THREE.Mesh(geometry, material);
    scene.add(terrain);

    // Set camera position and orientation
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    // Add orbital controls
    const controls = new OrbitControls( camera, renderer.domElement );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      container.removeChild(renderer.domElement);
    };
  }, [elevationData]);  // Added elevationData as a dependency

  return <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />;
};

export default ThreeJSScene;
