import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function WeatherScreen() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // Weather information
  // -----------------------------------------

  const getWeatherInfo = (code) => {
    if (code === 0) {
      return {
        title: 'Clear Sky',
        icon: '☀️',
        background:
          'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90',
      };
    }

    if (code >= 1 && code <= 3) {
      return {
        title: 'Cloudy',
        icon: '🌤️',
        background:
          'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=90',
      };
    }

    if (code >= 45 && code <= 48) {
      return {
        title: 'Foggy',
        icon: '🌫️',
        background:
          'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1200&q=90',
      };
    }

    if (code >= 51 && code <= 67) {
      return {
        title: 'Rainy',
        icon: '🌧️',
        background:
          'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=90',
      };
    }

    if (code >= 71 && code <= 77) {
      return {
        title: 'Snowy',
        icon: '❄️',
        background:
          'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=90',
      };
    }

    if (code >= 80 && code <= 82) {
      return {
        title: 'Rain Showers',
        icon: '🌦️',
        background:
          'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=90',
      };
    }

    if (code >= 95 && code <= 99) {
      return {
        title: 'Thunderstorm',
        icon: '⛈️',
        background:
          'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1200&q=90',
      };
    }

    return {
      title: 'Weather',
      icon: '🌤️',
      background:
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90',
    };
  };

  // -----------------------------------------
  // Get weather
  // -----------------------------------------

  const getWeather = async () => {
    if (!city.trim()) {
      Alert.alert('Enter a city', 'Please enter a city name.');
      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------
      // 1. Find city
      // -----------------------------------------

      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      const locationData = await locationResponse.json();

      if (
        !locationData.results ||
        locationData.results.length === 0
      ) {
        Alert.alert('City not found', 'Please try another city.');
        return;
      }

      const location = locationData.results[0];

      // -----------------------------------------
      // 2. Get weather + forecast
      // -----------------------------------------

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5&temperature_unit=celsius&wind_speed_unit=kmh`
      );

      const weatherData = await weatherResponse.json();

      setWeather({
        city: location.name,
        country: location.country,

        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        feelsLike: weatherData.current.apparent_temperature,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,

        forecast: weatherData.daily.time.map((date, index) => ({
          date,
          code: weatherData.daily.weather_code[index],
          max: weatherData.daily.temperature_2m_max[index],
          min: weatherData.daily.temperature_2m_min[index],
        })),
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not load weather. Check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Format forecast day
  // -----------------------------------------

  const getDayName = (date, index) => {
    if (index === 0) return 'Today';

    const day = new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
    });

    return day;
  };

  // -----------------------------------------
  // Empty state
  // -----------------------------------------

  if (!weather) {
    return (
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90',
        }}
        style={styles.background}
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.bigIcon}>🌤️</Text>

            <Text style={styles.appTitle}>
              Weather
            </Text>

            <Text style={styles.emptyText}>
              Search for a city to see the weather
            </Text>

            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a city..."
                placeholderTextColor="rgba(255,255,255,0.8)"
                value={city}
                onChangeText={setCity}
                onSubmitEditing={getWeather}
                returnKeyType="search"
              />

              <TouchableOpacity
                style={styles.searchButton}
                onPress={getWeather}
              >
                <Text style={styles.searchIcon}>⌕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const weatherInfo = getWeatherInfo(weather.weatherCode);

  // -----------------------------------------
  // Main screen
  // -----------------------------------------

  return (
    <ImageBackground
      source={{ uri: weatherInfo.background }}
      style={styles.background}
    >
      <View style={styles.overlay} />

      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search */}

          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city..."
              placeholderTextColor="rgba(255,255,255,0.8)"
              value={city}
              onChangeText={setCity}
              onSubmitEditing={getWeather}
              returnKeyType="search"
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={getWeather}
            >
              <Text style={styles.searchIcon}>⌕</Text>
            </TouchableOpacity>
          </View>

          {/* Loading */}

          {loading && (
            <ActivityIndicator
              size="large"
              color="#FFFFFF"
              style={styles.loading}
            />
          )}

          {/* Location */}

          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>

            <View>
              <Text style={styles.cityName}>
                {weather.city}
              </Text>

              <Text style={styles.country}>
                {weather.country}
              </Text>
            </View>
          </View>

          {/* Temperature */}

          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>
              {Math.round(weather.temperature)}°
            </Text>

            <Text style={styles.celsius}>C</Text>
          </View>

          {/* Condition */}

          <View style={styles.conditionContainer}>
            <Text style={styles.conditionIcon}>
              {weatherInfo.icon}
            </Text>

            <Text style={styles.condition}>
              {weatherInfo.title}
            </Text>
          </View>

          <Text style={styles.feelsLike}>
            Feels like {Math.round(weather.feelsLike)}°C
          </Text>

          {/* Information Card */}

          <View style={styles.glassCard}>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💧</Text>
              <Text style={styles.infoLabel}>Humidity</Text>
              <Text style={styles.infoValue}>
                {weather.humidity}%
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💨</Text>
              <Text style={styles.infoLabel}>Wind Speed</Text>
              <Text style={styles.infoValue}>
                {weather.windSpeed} km/h
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🌡️</Text>
              <Text style={styles.infoLabel}>Feels Like</Text>
              <Text style={styles.infoValue}>
                {Math.round(weather.feelsLike)}°C
              </Text>
            </View>
          </View>

          {/* Forecast */}

          <View style={styles.forecastCard}>
            <Text style={styles.forecastTitle}>
              5-Day Forecast
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {weather.forecast.map((day, index) => {
                const info = getWeatherInfo(day.code);

                return (
                  <View
                    key={day.date}
                    style={styles.forecastItem}
                  >
                    <Text style={styles.forecastDay}>
                      {getDayName(day.date, index)}
                    </Text>

                    <Text style={styles.forecastIcon}>
                      {info.icon}
                    </Text>

                    <Text style={styles.forecastMax}>
                      {Math.round(day.max)}°
                    </Text>

                    <Text style={styles.forecastMin}>
                      {Math.round(day.min)}°
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Search again */}

          <TouchableOpacity
            style={styles.changeCityButton}
            onPress={() => {
              setWeather(null);
              setCity('');
            }}
          >
            <Text style={styles.changeCityText}>
              Search another city
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// -----------------------------------------
// Styles
// -----------------------------------------

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 45, 90, 0.28)',
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Search

  searchBox: {
    flexDirection: 'row',
    height: 58,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginBottom: 25,
  },

  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    paddingHorizontal: 22,
  },

  searchButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  searchIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Location

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  locationIcon: {
    fontSize: 38,
    marginRight: 10,
  },

  cityName: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
  },

  country: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    marginTop: 2,
  },

  // Temperature

  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },

  temperature: {
    color: '#FFFFFF',
    fontSize: 90,
    fontWeight: '300',
  },

  celsius: {
    color: '#FFFFFF',
    fontSize: 35,
    marginTop: 20,
    fontWeight: '300',
  },

  // Condition

  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  conditionIcon: {
    fontSize: 38,
    marginRight: 12,
  },

  condition: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '600',
  },

  feelsLike: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    marginTop: 8,
    marginBottom: 25,
  },

  // Glass information card

  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 55, 90, 0.58)',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 22,
  },

  infoBox: {
    flex: 1,
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 24,
    marginBottom: 7,
  },

  infoLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    textAlign: 'center',
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },

  divider: {
    width: 1,
    height: 65,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // Forecast

  forecastCard: {
    backgroundColor: 'rgba(10, 55, 90, 0.58)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  forecastTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  forecastItem: {
    width: 85,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  forecastDay: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  forecastIcon: {
    fontSize: 30,
    marginVertical: 12,
  },

  forecastMax: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  forecastMin: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    marginTop: 4,
  },

  // Change city

  changeCityButton: {
    alignSelf: 'center',
    marginTop: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  changeCityText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty state

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },

  bigIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 10,
  },

  appTitle: {
    color: '#FFFFFF',
    fontSize: 45,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  emptyText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  loading: {
    marginVertical: 20,
  },
});