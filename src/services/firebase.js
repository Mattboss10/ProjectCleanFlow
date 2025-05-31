import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo0N4aZn-Yf7sVwoLe5J14roKNoTKa9Wk",
  authDomain: "project-cleanflow.firebaseapp.com",
  databaseURL: "https://project-cleanflow-default-rtdb.firebaseio.com",
  projectId: "project-cleanflow",
  storageBucket: "project-cleanflow.appspot.com",
  messagingSenderId: "422572054021",
  appId: "1:422572054021:web:dbed8045112429aefe2e6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 