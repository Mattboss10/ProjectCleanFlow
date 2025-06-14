import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase';
import { getDistance } from 'geolib';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const LOCATION_TRACKING = 'location-tracking';
const GEOFENCE_RADIUS = 100; // meters

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
const requestNotificationPermissions = async () => {
  // Skip notification setup in development
  if (__DEV__) {
    console.log('Skipping notification setup in development mode');
    return true;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  
  return true;
};

// Define the background task
TaskManager.defineTask(LOCATION_TRACKING, async ({ data: { locations }, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  const [location] = locations;
  if (!location) return;

  // Get reported areas from Firebase
  const areasRef = ref(database, 'reportedAreas');
  onValue(areasRef, (snapshot) => {
    const areas = snapshot.val() || {};
    
    // Check if user is near any reported area
    Object.values(areas).forEach(area => {
      const distance = getDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: area.center[0], longitude: area.center[1] }
      );

      if (distance <= GEOFENCE_RADIUS) {
        // Only send notification if not in development mode
        if (!__DEV__) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Reported Area Nearby",
              body: "You are near a reported area. Please be cautious.",
              data: { area },
            },
            trigger: null,
          });
        } else {
          console.log('Would send notification in production mode');
        }
      }
    });
  });
});

export const startLocationTracking = async () => {
  try {
    // Request notification permissions first
    await requestNotificationPermissions();

    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Background location permission denied');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Tracking location for nearby reported areas",
      },
    });
  } catch (err) {
    console.error('Error starting location tracking:', err);
  }
};

export const stopLocationTracking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
  } catch (err) {
    console.error('Error stopping location tracking:', err);
  }
};

export const saveReportedArea = async (coordinates) => {
  try {
    const areaId = Date.now().toString();
    const center = calculatePolygonCenter(coordinates);
    
    // Log the data we're saving
    console.log('Saving area with coordinates:', coordinates);
    
    const areaData = {
      coordinates: coordinates,
      center: center,
      timestamp: Date.now(),
      type: 'Feature',
      properties: {
        id: areaId
      }
    };
    
    await set(ref(database, `reportedAreas/${areaId}`), areaData);
    console.log('Area saved successfully:', areaData);
    
    return true;
  } catch (err) {
    console.error('Error saving reported area:', err);
    return false;
  }
};

export const getReportedAreas = async () => {
  console.log('Fetching reported areas from Firebase...');
  return new Promise((resolve) => {
    const areasRef = ref(database, 'reportedAreas');
    onValue(areasRef, (snapshot) => {
      const areas = snapshot.val() || {};
      console.log('Firebase returned areas:', areas);
      
      // Transform the data to ensure proper structure
      const transformedAreas = Object.entries(areas).reduce((acc, [id, area]) => {
        acc[id] = {
          ...area,
          type: 'Feature',
          properties: {
            ...area.properties,
            id: id
          }
        };
        return acc;
      }, {});
      
      console.log('Transformed areas:', transformedAreas);
      resolve(transformedAreas);
    }, (error) => {
      console.error('Firebase error:', error);
      resolve({});
    });
  });
};

// Helper function to calculate polygon center
const calculatePolygonCenter = (coordinates) => {
  const lats = coordinates.map(coord => coord[1]); // Use latitude (second value)
  const lngs = coordinates.map(coord => coord[0]); // Use longitude (first value)
  
  const centerLat = lats.reduce((a, b) => a + b) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b) / lngs.length;
  
  return [centerLng, centerLat]; // Keep as [lng, lat] for consistency
}; 