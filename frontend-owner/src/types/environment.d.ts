/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace AMap {
  interface Map {
    on(event: string, handler: (e: Event) => void): void;
    add(overlay: Marker): void;
    remove(overlay: Marker): void;
    setCenter(position: [number, number]): void;
    destroy(): void;
  }

  interface MapConstructor {
    new (container: string | HTMLElement, options: MapOptions): Map;
  }

  interface MapOptions {
    zoom?: number;
    center?: [number, number];
  }

  interface Marker {
    setPosition(position: [number, number]): void;
    getPosition(): { lng: number; lat: number };
    on(event: string, handler: (e: Event) => void): void;
    setAnimation(animation: string): void;  // Add this for animation support
  }

  interface MarkerConstructor {
    new (options: MarkerOptions): Marker;
  }

  interface MarkerOptions {
    position: [number, number];
    draggable?: boolean;
    animation?: 'AMAP_ANIMATION_NONE' | 'AMAP_ANIMATION_DROP' | 'AMAP_ANIMATION_BOUNCE';  // Add animation options
  }

  interface LngLat {
    lng: number;
    lat: number;
  }

  interface Event {
    lnglat: LngLat;
  }
}

declare interface Window {
  AMap: {
    Map: AMap.MapConstructor;
    Marker: AMap.MarkerConstructor;
  };
}
