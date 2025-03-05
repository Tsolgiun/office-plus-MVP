import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AutoComplete, Spin } from 'antd';
import debounce from 'lodash/debounce';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 16px;
`;

const SearchContainer = styled.div`
  margin-bottom: 8px;
  .ant-select {
    width: 100%;
  }
`;

interface Location {
  lng: number;
  lat: number;
}

interface SearchResult {
  name: string;
  address: string;
  location: Location;
  district?: string;
}

interface AMapProps {
  onLocationSelect?: (location: Location, address?: string) => void;
  readOnly?: boolean;
  initialLocation?: Location;
  style?: React.CSSProperties;
  showSearch?: boolean;
}

const AMapComponent: React.FC<AMapProps> = ({
  onLocationSelect,
  readOnly = false,
  initialLocation = { lng: 116.397428, lat: 39.90923 },
  style,
  showSearch = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<AMap.Map | null>(null);
  const marker = useRef<AMap.Marker | null>(null);
  const searchService = useRef<AMap.PlaceSearch | null>(null);
  const geocoder = useRef<AMap.Geocoder | null>(null);
  
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Update marker and map position when initialLocation changes
  useEffect(() => {
    if (marker.current && mapInstance.current && initialLocation) {
      const lng = Number(initialLocation.lng);
      const lat = Number(initialLocation.lat);
      
      if (isFinite(lng) && isFinite(lat)) {
        const position: [number, number] = [lng, lat];
        marker.current.setPosition(position);
        mapInstance.current.setCenter(position);
      } else {
        console.warn('Invalid coordinates detected:', initialLocation);
      }
    }
  }, [initialLocation]);

  // Initialize map and services
  useEffect(() => {
    if (!mapContainerRef.current || !window.AMap) return;

    const AMapSDK = window.AMap;

    // Initialize map
    mapInstance.current = new AMapSDK.Map(mapContainerRef.current, {
      zoom: 13,
      center: [initialLocation.lng, initialLocation.lat],
    });

    // Initialize marker
    marker.current = new AMapSDK.Marker({
      position: [initialLocation.lng, initialLocation.lat],
      draggable: !readOnly,
      animation: 'AMAP_ANIMATION_DROP'
    });

    // Add marker to map
    if (mapInstance.current && marker.current) {
      mapInstance.current.add(marker.current);
    }

    // Load plugins
    AMapSDK.plugin(['AMap.PlaceSearch', 'AMap.Geocoder'], () => {
      searchService.current = new AMapSDK.PlaceSearch({
        pageSize: 10,
        pageIndex: 1,
      });
      
      geocoder.current = new AMapSDK.Geocoder({
        radius: 1000,
        extensions: 'all'
      });
    });

    if (!readOnly && mapInstance.current) {
      // Add click handler for location selection
      mapInstance.current.on('click', (e: AMap.MapEvent) => {
        if (!e.lnglat || !isFinite(e.lnglat.lng) || !isFinite(e.lnglat.lat)) {
          console.warn('Invalid map click coordinates');
          return;
        }
        
        const lnglat = e.lnglat;
        if (marker.current && mapInstance.current) {
          const position: [number, number] = [lnglat.lng, lnglat.lat];
          marker.current.setPosition(position);
          updateAddressFromLocation(lnglat);
        }
      });

      // Add drag handler for marker
      if (marker.current) {
        marker.current.on('dragend', () => {
          if (marker.current) {
            const position = marker.current.getPosition();
            if (mapInstance.current) {
              mapInstance.current.setCenter([position.lng, position.lat]);
            }
            updateAddressFromLocation(position);
          }
        });
      }
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
        marker.current = null;
      }
    };
  }, [readOnly]); // Only recreate map if readOnly changes

  const debouncedSearch = debounce((value: string) => {
    if (!value.trim() || !searchService.current) return;

    setIsSearching(true);
    searchService.current.search(value, (status: string, result: AMap.PlaceSearchResult) => {
      setIsSearching(false);
      
      if (status === 'complete' && result.info === 'OK') {
        const results: SearchResult[] = result.poiList.pois.map((poi) => ({
          name: poi.name,
          address: poi.address,
          location: poi.location,
          district: poi.ad_info?.district
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    });
  }, 300);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleSelect = (value: string, option: { name: string }) => {
    const result = searchResults.find(r => r.name === option.name);
    if (result && marker.current && mapInstance.current) {
      const position: [number, number] = [result.location.lng, result.location.lat];
      marker.current.setPosition(position);
      mapInstance.current.setCenter(position);
      
      // Get detailed address information
      updateAddressFromLocation(result.location);
    }
  };

  const updateAddressFromLocation = (lnglat: AMap.MapEvent['lnglat']) => {
    if (!geocoder.current || !lnglat || !isFinite(lnglat.lng) || !isFinite(lnglat.lat)) return;
    
    geocoder.current.getAddress([lnglat.lng, lnglat.lat], (status: string, result: AMap.ReGeocodeResult) => {
      if (status === 'complete' && result.regeocode) {
        const formattedAddress = result.regeocode.formattedAddress;
        onLocationSelect?.({ lng: lnglat.lng, lat: lnglat.lat }, formattedAddress);
      }
    });
  };

  return (
    <>
      {showSearch && (
        <SearchContainer>
          <AutoComplete
            value={searchValue}
            onChange={handleSearch}
            onSelect={handleSelect}
            placeholder="搜索地址..."
            notFoundContent={isSearching ? <Spin size="small" /> : null}
            options={searchResults.map(result => ({
              label: (
                <div>
                  <div>{result.name}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {result.district ? `${result.district} - ` : ''}{result.address}
                  </div>
                </div>
              ),
              value: result.name,
              name: result.name
            }))}
          />
        </SearchContainer>
      )}
      <MapContainer ref={mapContainerRef} style={style} />
    </>
  );
};

export default AMapComponent;
