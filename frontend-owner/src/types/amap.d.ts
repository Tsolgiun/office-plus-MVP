declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options: MapOptions);
    on(event: string, handler: (e: MapEvent) => void): void;
    add(overlay: Marker): void;
    remove(overlay: Marker): void;
    destroy(): void;
    setCenter(position: [number, number]): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setPosition(position: [number, number]): void;
    getPosition(): LngLat;
    on(event: string, handler: (e: MapEvent) => void): void;
    setAnimation(animation: string): void;
  }

  class PlaceSearch {
    constructor(options?: PlaceSearchOptions);
    search(
      keyword: string,
      callback: (status: string, result: PlaceSearchResult) => void
    ): void;
  }

  class Geocoder {
    constructor(options?: GeocoderOptions);
    getAddress(
      location: LngLat | [number, number],
      callback: (status: string, result: ReGeocodeResult) => void
    ): void;
  }

  function plugin(plugins: string[], callback: () => void): void;

  interface MapOptions {
    zoom?: number;
    center?: [number, number];
    viewMode?: string;
    pitch?: number;
  }

  interface MarkerOptions {
    position: [number, number];
    draggable?: boolean;
    animation?: string;
    title?: string;
  }

  interface PlaceSearchOptions {
    pageSize?: number;
    pageIndex?: number;
    city?: string;
    citylimit?: boolean;
    type?: string;
    extensions?: string;
  }

  interface GeocoderOptions {
    radius?: number;
    extensions?: string;
  }

  interface LngLat {
    lng: number;
    lat: number;
  }

  interface MapEvent {
    lnglat: LngLat;
  }

  interface PlaceSearchResult {
    info: string;
    poiList: {
      pois: Array<{
        location: LngLat;
        name: string;
        address: string;
        type: string;
        id: string;
        ad_info?: {
          district: string;
          city: string;
        };
      }>;
    };
  }

  interface ReGeocodeResult {
    info: string;
    regeocode: {
      formattedAddress: string;
      addressComponent: {
        district: string;
        township: string;
        street: string;
        streetNumber: string;
      };
    };
  }
}

declare global {
  interface Window {
    AMap: typeof AMap;
  }
}

export {};
