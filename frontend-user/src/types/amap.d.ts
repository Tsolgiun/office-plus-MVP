declare namespace AMap {
  interface Map {
    on(event: string, handler: (e: Event) => void): void;
    add(overlay: Marker): void;
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
  }

  interface MarkerConstructor {
    new (options: MarkerOptions): Marker;
  }

  interface MarkerOptions {
    position: [number, number];
    draggable?: boolean;
  }

  interface LngLat {
    lng: number;
    lat: number;
  }

  interface Event {
    lnglat: LngLat;
  }
}

declare global {
  interface Window {
    AMap: {
      Map: AMap.MapConstructor;
      Marker: AMap.MarkerConstructor;
    };
  }
}

export {};
