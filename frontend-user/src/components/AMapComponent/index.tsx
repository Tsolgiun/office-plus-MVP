import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 16px;
`;

interface Location {
  lng: number;
  lat: number;
}

interface AMapProps {
  onLocationSelect?: (location: Location) => void;
  readOnly?: boolean;
  initialLocation?: Location;
  style?: React.CSSProperties;
}

const AMapComponent: React.FC<AMapProps> = ({
  onLocationSelect,
  readOnly = false,
  initialLocation = { lng: 116.397428, lat: 39.90923 },
  style
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<AMap.Map | null>(null);
  const marker = useRef<AMap.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.AMap) return;

    // Initialize map
    mapInstance.current = new window.AMap.Map(mapContainerRef.current, {
      zoom: 13,
      center: [initialLocation.lng, initialLocation.lat],
    });

    // Initialize marker with initial location
    marker.current = new window.AMap.Marker({
      position: [initialLocation.lng, initialLocation.lat],
      draggable: !readOnly,
    });

    // Add marker to map
    mapInstance.current.add(marker.current);

    if (!readOnly) {
      // Add click handler for location selection
      mapInstance.current.on('click', (e: AMap.Event) => {
        const lnglat = e.lnglat;
        if (marker.current) {
          marker.current.setPosition([lnglat.lng, lnglat.lat]);
          onLocationSelect?.({ lng: lnglat.lng, lat: lnglat.lat });
        }
      });

      // Add drag handler for marker
      if (marker.current) {
        marker.current.on('dragend', () => {
          if (marker.current) {
            const position = marker.current.getPosition();
            onLocationSelect?.({ lng: position.lng, lat: position.lat });
          }
        });
      }
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, [initialLocation, readOnly, onLocationSelect]);

  return <MapContainer ref={mapContainerRef} style={style} />;
};

export default AMapComponent;
