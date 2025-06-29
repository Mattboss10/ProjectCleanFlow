import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { startLocationTracking, stopLocationTracking, saveReportedArea, getReportedAreas } from './src/services/locationService';
import Constants from 'expo-constants';
import { mapHtml } from './src/mapTemplate';

export default function App() {
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [location, setLocation] = useState(null);
  const [reportedAreas, setReportedAreas] = useState({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  // Load reported areas
  useEffect(() => {
    const loadReportedAreas = async () => {
      try {
        console.log('Attempting to load reported areas...');
        const areas = await getReportedAreas();
        console.log('Received areas from Firebase:', areas);
        setReportedAreas(areas);
      } catch (err) {
        console.error('Error loading reported areas:', err);
        setError('Failed to load reported areas');
      }
    };

    loadReportedAreas();
  }, []);

  // Handle map initialization and location setup
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      try {
        await startLocationTracking();
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (err) {
        setError('Error getting location: ' + err.message);
      }
    })();

    return () => {
      stopLocationTracking();
    };
  }, []);

  // Update map when location or reported areas change
  useEffect(() => {
    if (!isMapReady || !webViewRef.current) return;

    console.log('Map ready, updating with areas:', reportedAreas);
    // Log the structure of the first area
    const firstAreaKey = Object.keys(reportedAreas)[0];
    if (firstAreaKey) {
      console.log('First area structure:', JSON.stringify(reportedAreas[firstAreaKey], null, 2));
    }

    const updateMap = () => {
      if (location) {
        webViewRef.current.injectJavaScript(`
          window.updateMapView(${location.coords.latitude}, ${location.coords.longitude}, 15);
        `);
      }

      if (Object.keys(reportedAreas).length > 0) {
        // Convert the areas to a simpler format
        const simplifiedAreas = Object.entries(reportedAreas).reduce((acc, [id, area]) => {
          acc[id] = {
            coordinates: area.coordinates,
            properties: { id }
          };
          return acc;
        }, {});

        console.log('Sending simplified areas to WebView:', simplifiedAreas);
        webViewRef.current.injectJavaScript(`
          (function() {
            try {
              window.updateReportedAreas(${JSON.stringify(simplifiedAreas)});
              console.log('Areas update function called');
            } catch (error) {
              console.error('Error updating areas:', error);
            }
          })();
        `);
      }
    };

    updateMap();
  }, [location, reportedAreas, isMapReady]);

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', data);
      
      if (data.type === 'mapReady') {
        console.log('Map is ready, setting isMapReady to true');
        setIsMapReady(true);
        setIsLoading(false);
      } else if (data.type === 'requestLocation') {
        if (location) {
          console.log('Sending location to map:', location);
          webViewRef.current?.injectJavaScript(`
            (function() {
              if (window.map) {
                window.map.setView([${location.coords.latitude}, ${location.coords.longitude}], 15);
                console.log('Map view updated with location');
              }
              true;
            })();
          `);
        }
      } else if (data.type === 'areaDeleted') {
        console.log('Area deleted:', JSON.stringify(data.geometry, null, 2));
      } else if (data.type === 'polygon') {
        const success = await saveReportedArea(data.geometry.coordinates[0]);
        if (success) {
          Alert.alert('Success', 'Area has been reported and saved.');
          const areas = await getReportedAreas();
          setReportedAreas(areas);
        } else {
          Alert.alert('Error', 'Failed to save reported area.');
        }
        setActiveReport(data);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
      setError('Error processing map data');
    }
  };

  const handleReportAreaPress = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          if (window.activatePolygonDrawing) {
            window.activatePolygonDrawing();
          } else {
            console.error('activatePolygonDrawing function not found');
          }
          true;
        })();
      `);
    }
  };

  const handleViewReportsPress = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          if (window.map && window.drawnItems) {
            const bounds = window.drawnItems.getBounds();
            if (bounds.isValid()) {
              window.map.fitBounds(bounds, { padding: [50, 50] });
            } else {
              window.map.setView(window.map.getCenter(), 9);
            }
            setTimeout(() => {
              window.map.invalidateSize();
            }, 100);
          }
          true;
        })();
      `);
    }
  };

  const MenuButton = () => (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => setMenuVisible(true)}
    >
      <Text style={styles.menuButtonText}>☰</Text>
    </TouchableOpacity>
  );

  const Menu = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={menuVisible}
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}
      >
        <View style={styles.menuContent}>
          <ScrollView>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>📋 My Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>❓ Help</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const renderFallback = () => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackTitle}>Map Unavailable</Text>
      <Text style={styles.fallbackText}>
        We're having trouble loading the map. Please check your internet connection and try again.
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => {
          setIsLoading(true);
          setError(null);
          // Force WebView reload
          if (webViewRef.current) {
            webViewRef.current.reload();
          }
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CleanFlow</Text>
        <MenuButton />
      </View>
      
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={[styles.webview, isLoading && styles.hidden]}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setError(nativeEvent.description);
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
            setError(`HTTP error: ${nativeEvent.statusCode}`);
            setIsLoading(false);
          }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onLoadEnd={() => {
            console.log('WebView loaded');
          }}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.reportButton]}
          onPress={handleReportAreaPress}
        >
          <Text style={styles.actionButtonText}>Select Area to Report</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={handleViewReportsPress}
        >
          <Text style={styles.actionButtonText}>See Reported Areas</Text>
        </TouchableOpacity>
      </View>

      <Menu />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2196F3',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#2196F3',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff5252',
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '70%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

