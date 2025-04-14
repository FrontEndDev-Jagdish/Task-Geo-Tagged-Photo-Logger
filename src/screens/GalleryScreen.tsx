import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { VStack, Text } from '@gluestack-ui/themed';

interface PhotoItem {
  imageUrl: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const GalleryScreen = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const snapshot = await firestore()
          ?.collection('photos')
          ?.where('uid', '==', currentUser.uid)
          ?.orderBy('timestamp', 'desc')
          ?.get();

        const data = snapshot.docs.map((doc) => doc?.data() as PhotoItem);
        setPhotos(data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    loadPhotos();
  }, []);

  const renderItem = ({ item }: { item: PhotoItem }) => (
    <VStack style={styles.card} space="sm">
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text>
        Lat: {item?.latitude}, Lon: {item?.longitude}
      </Text>
      <Text>{new Date(item.timestamp).toLocaleString()}</Text>
    </VStack>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 8,
  },
});

export default GalleryScreen;