export interface Train {
  id: string;
  number: string;
  name: string;
  source: string;
  destination: string;
  totalDistanceKm: number;
  type: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  zone?: string;
}

export interface StationStop {
  station: Station;
  sequence: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival?: string;
  actualDeparture?: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' | 'DELAYED' | 'SKIPPED';
  delayMinutes: number;
  distanceFromSourceKm: number;
  platform?: string;
}

export interface TrainPosition {
  latitude: number;
  longitude: number;
  speedKmh: number;
  bearing: number;
  timestamp: string;
}

export type JourneyStatus = 'ON_TIME' | 'DELAYED' | 'EARLY' | 'UNKNOWN' | 'DATA_UNAVAILABLE';

export interface Journey {
  train: Train;
  status: JourneyStatus;
  delayMinutes: number;
  currentStation?: StationStop;
  nextStation?: StationStop;
  previousStation?: StationStop;
  position: TrainPosition;
  progressPercentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  updatedAt: string;
}

export interface RouteGeometry {
  distanceKm: number;
  stations: StationStop[];
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat]
  };
}

export interface WeatherCondition {
  locationName: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  condition: string;
  icon: string;
}

export interface RouteWeatherResponse {
  currentStationWeather?: WeatherCondition;
  nextStationWeather?: WeatherCondition;
  destinationWeather?: WeatherCondition;
  stationForecasts: { stationCode: string; weather: WeatherCondition }[];
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  stationName?: string;
}

export interface ElevationProfileResponse {
  highestElevation: number;
  lowestElevation: number;
  elevationGain: number;
  elevationLoss: number;
  profile: ElevationPoint[];
}

export interface PlacePOI {
  id: string;
  name: string;
  type: 'river' | 'lake' | 'mountain' | 'bridge' | 'tunnel' | 'monument' | 'city';
  latitude: number;
  longitude: number;
  distanceFromRouteKm: number;
  description?: string;
}
