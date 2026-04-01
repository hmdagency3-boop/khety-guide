import { useState, useEffect } from "react";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  weatherCode: number;
  timezone: string;
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: boolean;
}

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

export function weatherIcon(code: number): string {
  return weatherEmoji(code);
}

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ data: null, loading: true, error: false });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ data: null, loading: false, error: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
            ),
          ]);

          const weather = await weatherRes.json();
          const geo = await geoRes.json();

          const city =
            geo.address?.city ||
            geo.address?.town ||
            geo.address?.village ||
            geo.address?.county ||
            "";
          const country = geo.address?.country_code?.toUpperCase() || "";

          setState({
            data: {
              city,
              country,
              temp: Math.round(weather.current.temperature_2m),
              weatherCode: weather.current.weathercode,
              timezone: weather.timezone,
            },
            loading: false,
            error: false,
          });
        } catch {
          setState({ data: null, loading: false, error: true });
        }
      },
      () => setState({ data: null, loading: false, error: true }),
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return state;
}

export function useLocalTime(timezone: string | null) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timezone) return { time: "", date: "" };

  const time = now.toLocaleTimeString("ar-EG", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const date = now.toLocaleDateString("ar-EG", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return { time, date };
}
