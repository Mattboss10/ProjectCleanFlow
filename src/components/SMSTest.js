import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';

const SMSTest = ({ visible, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendSMS = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter both phone number and message');
      return;
    }

    setIsLoading(true);
    
    // Simulate SMS sending
    setTimeout(() => {
      setIsLoading(false);
      
      // Log the SMS details (in a real app, this would send to an SMS service)
      console.log('📱 SMS TEST:');
      console.log('📱 To:', phoneNumber);
      console.log('📱 Message:', message);
      console.log('📱 Would send via SMS service (Twilio, AWS SNS, etc.)');
      
      Alert.alert(
        'SMS Test Complete',
        `Message would be sent to ${phoneNumber}:\n\n"${message}"\n\nCheck console for details.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setPhoneNumber('');
              setMessage('');
            }
          }
        ]
      );
    }, 2000);
  };

  const handleNearbyAreaTest = () => {
    const testMessage = "You are 85m from a reported area. Please be cautious.";
    setMessage(testMessage);
    Alert.alert(
      'Nearby Area Test',
      'This simulates the SMS notification you would receive when near a reported area.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>SMS Testing</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Phone Number:</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              editable={!isLoading}
            />

            <Text style={styles.label}>Message:</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your test message..."
              multiline={true}
              numberOfLines={4}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleNearbyAreaTest}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>Test Nearby Area Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendSMS}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send Test SMS</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>How SMS Testing Works:</Text>
              <Text style={styles.infoText}>
                • This simulates SMS sending for testing purposes{'\n'}
                • In production, integrate with Twilio, AWS SNS, or similar{'\n'}
                • Messages are logged to console for verification{'\n'}
                • No actual SMS is sent in this demo mode
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default SMSTest; 