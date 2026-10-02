import { WeatherCondition, RouteWeatherResponse } from '../types/index.js';

export class WeatherProvider {
  async getWeatherForCoords(lat: number, lng: number, locationName: string): Promise<WeatherCondition> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`);
        if (res.ok) {
          const data = await res.json();
          return {
            locationName: data.name || locationName,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
            rainProbability: data.pop ? Math.round(data.pop * 100) : 15,
            condition: data.weather[0]?.main || 'Partly Cloudy',
            icon: data.weather[0]?.icon || '02d'
          };
        }
      } catch (err) {
        console.warn('OpenWeather fetch failed, fallback used:', err);
      }
    }

    // Deterministic realistic weather mock based on lat/lng
    const hash = Math.abs(Math.floor(lat * 100 + lng * 50)) % 4;
    const conditions = ['Sunny', 'Partly Cloudy', 'Hazy', 'Thunderstorm'];
    const temp = Math.round(28 + (hash % 5) - 2);

    return {
      locationName,
      temperature: temp,
      feelsLike: temp + 2,
      humidity: 62 + hash * 3,
      windSpeed: 12 + hash * 2,
      rainProbability: hash === 3 ? 65 : 15,
      condition: conditions[hash],
      icon: hash === 0 ? '01d' : hash === 1 ? '02d' : hash === 2 ? '50d' : '11d'
    };
  }

  async getRouteWeather(currLat: number, currLng: number, currName: string, nextLat: number, nextLng: number, nextName: string, destLat: number, destLng: number, destName: string): Promise<RouteWeatherResponse> {
    const [currentStationWeather, nextStationWeather, destinationWeather] = await Promise.all([
      this.getWeatherForCoords(currLat, currLng, currName),
      this.getWeatherForCoords(nextLat, nextLng, nextName),
      this.getWeatherForCoords(destLat, destLng, destName)
    ]);

    return {
      currentStationWeather,
      nextStationWeather,
      destinationWeather,
      stationForecasts: [
        { stationCode: currName, weather: currentStationWeather },
        { stationCode: nextName, weather: nextStationWeather },
        { stationCode: destName, weather: destinationWeather }
      ]
    };
  }
}

export const weatherProvider = new WeatherProvider();
