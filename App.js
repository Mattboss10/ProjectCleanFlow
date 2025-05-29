import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setActiveReport(data);
      // You can handle the report data here
      console.log('Received report:', data);
    } catch (e) {
      console.error('Error parsing WebView message:', e);
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
                // Handle My Reports
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>📋 My Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                // Handle Settings
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                // Handle Help
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

      <View style={styles.footer}>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>📝 New Report</Text>
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
});
