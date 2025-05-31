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
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { startLocationTracking, stopLocationTracking, saveReportedArea, getReportedAreas } from './src/services/locationService';

export default function App() {
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [location, setLocation] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      try {
        // Start background location tracking
        await startLocationTracking();
        
        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Load reported areas
        const areas = await getReportedAreas();
        if (areas && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            (function() {
              if (window.map) {
                ${Object.values(areas).map(area => `
                  L.polygon(${JSON.stringify(area.coordinates)}, {
                    color: '#2196F3',
                    weight: 2
                  }).addTo(window.drawnItems);
                `).join('')}
              }
              true;
            })();
          `);
        }

        // Update map with location
        if (webViewRef.current && location) {
          webViewRef.current.injectJavaScript(`
            (function() {
              if (window.map) {
                window.map.setView([${location.coords.latitude}, ${location.coords.longitude}], 15);
              }
              true;
            })();
          `);
        }
      } catch (err) {
        setError('Error getting location: ' + err.message);
      }
    })();

    // Cleanup function
    return () => {
      stopLocationTracking();
    };
  }, []);

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'requestLocation') {
        if (location) {
          webViewRef.current?.injectJavaScript(`
            (function() {
              if (window.map) {
                window.map.setView([${location.coords.latitude}, ${location.coords.longitude}], 15);
              }
              true;
            })();
          `);
        }
      } else if (data.type === 'areaDeleted') {
        console.log('Area deleted:', JSON.stringify(data.geometry, null, 2));
      } else if (data.type === 'polygon') {
        // Save reported area to Firebase
        const success = await saveReportedArea(data.geometry.coordinates[0]);
        if (success) {
          Alert.alert('Success', 'Area has been reported and saved.');
        } else {
          Alert.alert('Error', 'Failed to save reported area.');
        }
        setActiveReport(data);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  const handleReportAreaPress = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          document.getElementById('polygonButton').click();
          document.getElementById('guideArrow').style.display = 'block';
          true;
        })();
      `);
    }
  };

  const handleViewReportsPress = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          if (window.map) {
            const bounds = window.drawnItems.getBounds();
            if (bounds.isValid()) {
              window.map.fitBounds(bounds, { padding: [50, 50] });
            } else {
              window.map.setView(window.map.getCenter(), 9);
            }
            // Force a map refresh
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CleanFlow</Text>
        <MenuButton />
      </View>
      
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'http://192.168.100.211:3000/leafletMap.html' }}
          style={styles.webview}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setError(nativeEvent.description);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
            setError(`HTTP error: ${nativeEvent.statusCode}`);
          }}
          onMessage={handleWebViewMessage}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webview: {
    flex: 1,
    borderRadius: 15,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reportButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff5252',
    padding: 10,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

