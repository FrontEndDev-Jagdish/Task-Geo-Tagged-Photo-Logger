import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface PhotoItem {
  imageUrl: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const MapScreen = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const snapshot = await firestore()
          ?.collection('photos')
          ?.where('uid', '==', currentUser.uid)
          ?.get();

        const data = snapshot?.docs?.map((doc) => doc?.data() as PhotoItem);
        setPhotos(data);
      } catch (err) {
        console.error('Failed to load map photos:', err);
      }
    };

    loadPhotos();
  }, []);

  return (
    <MapView style={styles.map}>
      {photos.map((photo, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: photo?.latitude,
            longitude: photo?.longitude,
          }}
        >
          <Callout>
            <Image source={{ uri: photo?.imageUrl }} style={styles.calloutImage} />
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  calloutImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
});

export default MapScreen;
