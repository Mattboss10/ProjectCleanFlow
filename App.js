import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [error, setError] = React.useState(null);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'http://<Your-IP>:3000/leafletMap.html' }}
        style={{ flex: 1 }}
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
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Load ended: ', nativeEvent);
        }}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'red',
    padding: 10,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});
