import React, { useState } from 'react';
import {
  View,
  Image,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text, VStack } from '@gluestack-ui/themed';
import { launchCamera, Asset } from 'react-native-image-picker';
import { uploadPhoto } from '../services/upload';

const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need your location to tag the photo.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Permission Denied', 'Location access is required.');
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Location permission error:', err);
    return false;
  }
};

const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'We need access to your camera.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

const UploadScreen = () => {
  const [image, setImage] = useState<Asset | null>(null);

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await launchCamera({ mediaType: 'photo', includeBase64: true });

      if (result?.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      } else {
        Alert.alert('No photo taken or canceled');
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error launching camera');
    }
  };

  const upload = async () => {
    const hasLocation = await requestLocationPermission();
    if (!hasLocation) return;

    if (!image?.base64) {
      Alert.alert('No image selected to upload.');
      return;
    }

    try {
      const success = await uploadPhoto(image.base64);
      if (success) {
        Alert.alert('Success', 'Photo uploaded!');
        setImage(null);
      } else {
        Alert.alert('Upload failed. Try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Something went wrong during upload.');
    }
  };

  return (
    <View style={styles.container}>
      <VStack space="md">
        {image && (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        )}

        <TouchableOpacity style={styles.buttonPrimary} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity style={styles.buttonSuccess} onPress={upload}>
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
        )}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  buttonPrimary: {
    backgroundColor: '#288fde',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  buttonSuccess: {
    backgroundColor: '#30ba54',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default UploadScreen;
