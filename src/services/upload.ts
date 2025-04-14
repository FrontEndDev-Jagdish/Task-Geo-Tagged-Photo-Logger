import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Location permission denied');
    }
  }
};

const uploadPhoto = async (base64: string): Promise<{ imageUrl: string; latitude: number; longitude: number } | null> => {
  try {
    // location permission (Android)
    await requestLocationPermission();

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const user = auth().currentUser;

          if (!user) {
            return reject('User is not authenticated');
          }

          const fileName = `${user.uid}/${uuidv4()}.jpg`;
          const ref = storage().ref(fileName);

          try {
            // Upload photo - Firebase storage
            await ref.putString(base64, 'base64');
            const downloadURL = await ref.getDownloadURL();

            resolve({ imageUrl: downloadURL, latitude, longitude });
          } catch (uploadError) {
            console.error('Storage upload error:', uploadError);
            reject(uploadError);
          }
        },
        (geolocationError) => {
          console.error('Geolocation error:', geolocationError);
          reject(geolocationError);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

export { uploadPhoto };
