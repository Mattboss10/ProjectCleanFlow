import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase';
import { getDistance } from 'geolib';

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
        // Send notification
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Reported Area Nearby",
            body: "You are near a reported area. Please be cautious.",
          },
          trigger: null,
        });
      }
    });
  });
});

export const startLocationTracking = async () => {
  try {
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
    
    await set(ref(database, `reportedAreas/${areaId}`), {
      coordinates,
      center,
      timestamp: Date.now(),
    });
    
    return true;
  } catch (err) {
    console.error('Error saving reported area:', err);
    return false;
  }
};

export const getReportedAreas = async () => {
  return new Promise((resolve) => {
    const areasRef = ref(database, 'reportedAreas');
    onValue(areasRef, (snapshot) => {
      resolve(snapshot.val() || {});
    });
  });
};

// Helper function to calculate polygon center
const calculatePolygonCenter = (coordinates) => {
  const lats = coordinates.map(coord => coord[0]);
  const lngs = coordinates.map(coord => coord[1]);
  
  const centerLat = lats.reduce((a, b) => a + b) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b) / lngs.length;
  
  return [centerLat, centerLng];
}; 