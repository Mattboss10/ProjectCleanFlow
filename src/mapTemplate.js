export const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CleanFlow Map</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
  <style>
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .leaflet-draw-tooltip {
      display: none;
    }
    .leaflet-draw-actions {
      display: none;
    }
    .success-message {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 1000;
      display: none;
    }
    /* Custom styles for draw control descriptions */
    .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
      position: relative;
    }
    .leaflet-draw-toolbar .leaflet-draw-draw-polygon::after {
      content: "Select Area";
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.6);
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-size: 12px;
      white-space: nowrap;
      margin-left: 8px;
      z-index: 1000;
      display: var(--description-display, block);
    }
    .leaflet-draw-toolbar .leaflet-draw-edit-edit {
      position: relative;
    }
    .leaflet-draw-toolbar .leaflet-draw-edit-edit::after {
      content: "Edit";
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.6);
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-size: 12px;
      white-space: nowrap;
      margin-left: 8px;
      z-index: 1000;
      display: var(--description-display, block);
    }
    /* Hide descriptions when drawing mode is active */
    .leaflet-draw-toolbar.leaflet-draw-toolbar-draw .leaflet-draw-draw-polygon::after,
    .leaflet-draw-toolbar.leaflet-draw-toolbar-edit .leaflet-draw-edit-edit::after {
      display: none;
    }
    /* Hide descriptions when buttons are pressed */
    .leaflet-draw-toolbar .leaflet-draw-draw-polygon.pressed::after,
    .leaflet-draw-toolbar .leaflet-draw-edit-edit.pressed::after {
      display: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="successMessage" class="success-message">Area reported successfully!</div>
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
  <script>
    console.log('Initializing map...');
    let map = L.map('map', {
      center: [17.995839910833137, -76.92207808608816], // Center on Jamaica
      zoom: 15,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Add a test polygon
    const testPolygon = L.polygon([
      [17.996217606219055, -76.92192594639256],
      [17.995824599110577, -76.92236625657041],
      [17.99547752716978, -76.9219420553015]
    ], {
      color: 'red',
      fillOpacity: 0.3
    }).addTo(drawnItems);

    console.log('Test polygon added to map');

    let drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e4e8',
            message: '<strong>Error:</strong> polygon edges cannot intersect!'
          },
          shapeOptions: {
            color: '#2196F3'
          }
        },
        circle: false,
        rectangle: false,
        polyline: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);

    // Function to activate polygon drawing mode
    window.activatePolygonDrawing = function() {
      console.log('Activating polygon drawing mode');
      // Find the polygon draw button and click it
      const polygonButton = document.querySelector('.leaflet-draw-draw-polygon');
      if (polygonButton) {
        // Hide the description immediately
        polygonButton.style.setProperty('--description-display', 'none');
        polygonButton.click();
        console.log('Polygon drawing mode activated');
      } else {
        console.error('Polygon button not found');
      }
    };

    // Add event listeners after controls are added
    setTimeout(function() {
      const polygonButton = document.querySelector('.leaflet-draw-draw-polygon');
      const editButton = document.querySelector('.leaflet-draw-edit-edit');
      
      if (polygonButton) {
        polygonButton.addEventListener('click', function() {
          this.style.setProperty('--description-display', 'none');
        });
      }
      
      if (editButton) {
        editButton.addEventListener('click', function() {
          this.style.setProperty('--description-display', 'none');
        });
      }
    }, 100);

    map.on('draw:created', function(e) {
      console.log('Draw created event fired');
      let layer = e.layer;
      drawnItems.addLayer(layer);
      
      let coordinates = layer.getLatLngs()[0].map(latLng => [latLng.lng, latLng.lat]);
      let center = layer.getBounds().getCenter();
      
      console.log('Sending drawn area to React Native:', {
        coordinates: coordinates,
        center: [center.lng, center.lat]
      });
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'polygon',
        geometry: {
          coordinates: [coordinates],
          type: 'Polygon'
        }
      }));
      
      document.getElementById('successMessage').style.display = 'block';
      setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
      }, 2000);
    });

    map.on('draw:edited', function(e) {
      console.log('Draw edited event fired');
      let layers = e.layers;
      layers.eachLayer(function(layer) {
        let coordinates = layer.getLatLngs()[0].map(latLng => [latLng.lng, latLng.lat]);
        let center = layer.getBounds().getCenter();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'updateArea',
          coordinates: coordinates,
          center: [center.lng, center.lat]
        }));
      });
    });

    map.on('draw:deleted', function(e) {
      console.log('Draw deleted event fired');
      let layers = e.layers;
      layers.eachLayer(function(layer) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'deleteArea'
        }));
      });
    });

    // Notify React Native that the map is ready
    console.log('Map initialized with drawnItems');
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));

    // Function to update reported areas
    window.updateReportedAreas = function(areas) {
      console.log('Updating reported areas:', areas);
      if (!map || !drawnItems) {
        console.error('Map or drawnItems not initialized');
        return;
      }

      try {
        drawnItems.clearLayers();
        // Keep the test polygon
        testPolygon.addTo(drawnItems);
        
        Object.values(areas).forEach(area => {
          try {
            console.log('Processing area:', area);
            if (!area.coordinates || !Array.isArray(area.coordinates)) {
              console.error('Invalid coordinates for area:', area);
              return;
            }

            // Convert coordinates to [lat, lng] format for Leaflet
            const latLngs = area.coordinates.map(coord => [coord[1], coord[0]]);
            console.log('Creating polygon with coordinates:', latLngs);

            const polygon = L.polygon(latLngs, {
              color: '#2196F3',
              weight: 2,
              fillOpacity: 0.3
            });

            console.log('Adding polygon to map');
            polygon.addTo(drawnItems);
            console.log('Polygon added successfully');
          } catch (error) {
            console.error('Error processing area:', error);
          }
        });
      } catch (error) {
        console.error('Error updating reported areas:', error);
      }
    };

    // Function to update map view
    window.updateMapView = function(lat, lng, zoom) {
      console.log('Updating map view:', { lat, lng, zoom });
      if (map) {
        map.setView([lat, lng], zoom || 15);
      }
    };

    // Add error handler for the window
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.error('Window error:', { msg, url, lineNo, columnNo, error });
      return false;
    };
  </script>
</body>
</html>
`; 