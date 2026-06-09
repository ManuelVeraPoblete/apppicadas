import React, { memo, useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { NearbyPlace } from '../../types';

type Props = {
  place: NearbyPlace;
  onPress: (place: NearbyPlace) => void;
};

const PIN = require('../../../assets/pin.png');

function PlaceMapMarkerComponent({ place, onPress }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      identifier={place.id}
      coordinate={{ latitude: Number(place.latitude), longitude: Number(place.longitude) }}
      tracksViewChanges={tracksViewChanges}
      onPress={() => onPress(place)}
    >
      <Image source={PIN} style={styles.pin} resizeMode="contain" />
    </Marker>
  );
}

export const PlaceMapMarker = memo(PlaceMapMarkerComponent);

const styles = StyleSheet.create({
  pin: {
    width: 43,
    height: 43,
  },
});
