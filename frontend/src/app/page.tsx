"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type WeatherData = {
  temperature: number;
  feels_like: number;
  high: number;
  low: number;
  wind_speed: number;
  condition: string;
  scene: string;
  lighting: string;
  effects: {
    rain: boolean;
    snow: boolean;
    clouds: boolean;
    fog: boolean;
    lightning: boolean;
    sunlight: boolean;
    stars: boolean;
  };
  location: {
    timezone: string;
  };
  sunrise: string;
  sunset: string;
};

// search
type CityResult = {
  name: string;
  region: string | null;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [skyPhase, setSkyPhase] = useState<
    "day" | "night" | "sunrise" | "sunset"
  >("night");
  const [cityQuery, setCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState("Mineola, US")

  async function loadWeather(latitude: number, longitude: number){
    try{
      setError("");
      const response = await fetch(
        `http://127.0.0.1:8000/scene?latitude=${latitude}&longitude=${longitude}`
      );
      if(!response.ok){
        throw new Error("Could not load weather");
      }
      const data: WeatherData = await response.json();
      setWeather(data);

      const timeParts=new Intl.DateTimeFormat("en-US", {
        timeZone: data.location.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());

      const hour = Number(timeParts.find(p=>p.type==="hour")?.value);
      const minute = Number(timeParts.find(p=>p.type==="minute")?.value);
      const currentMinutes = hour*60+minute;
      const sunrise = data.sunrise.split("T")[1].slice(0,5);
      const sunset = data.sunset.split("T")[1].slice(0,5);
      const [sunriseHour, sunriseMinute] = sunrise.split(":").map(Number);
      const [sunsetHour, sunsetMinute] = sunset.split(":").map(Number);
      const sunriseMinutes = sunriseHour*60+sunriseMinute;
      const sunsetMinutes = sunsetHour*60+sunsetMinute;
      if(
        currentMinutes>=sunriseMinutes-30 &&
        currentMinutes <= sunriseMinutes+30
      ){
        setSkyPhase("sunrise");
      } else if(
        currentMinutes>=sunsetMinutes-30 &&
        currentMinutes<=sunsetMinutes+30
      ){
        setSkyPhase("sunset");
      } else if(
        currentMinutes>sunriseMinutes+30 &&
        currentMinutes<sunsetMinutes-30
      ){
        setSkyPhase("day");
      } else{
        setSkyPhase("night");
      } 
    } catch(err) {
      setError("Weather data unavailabale");
      console.error(err);
    }
  }
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    );
    loadWeather(40.752888, -73.64725);
  }, []);

  // search suggestions
  useEffect(() => {
    if(cityQuery.trim().length <2){
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try{
        const response = await fetch(
            `http://127.0.0.1:8000/geocode?city=${encodeURIComponent(cityQuery)}`
        );
        if(!response.ok){
          setSuggestions([]);
          return;
        }
        const data=await response.json();
        setSuggestions(data.results);
      } catch(err){
        console.error(err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [cityQuery]);

  function selectCity(city: CityResult){
    const label=[
      city.name,
      city.region,
      city.country,
    ].filter(Boolean).join(", ");
    setSelectedCity(label);
    setCityQuery("");
    setSuggestions([]);
    loadWeather(city.latitude, city.longitude);
  }

  return(
    <main className={`${styles.page} ${
      skyPhase === "day"
        ? styles.day
        : skyPhase === "sunrise"
        ? styles.sunrise
        : skyPhase === "sunset"
        ? styles.sunset
        : styles.night
    }`}>
      <header className={styles.header}>
        <input
          className={styles.search}
          type="text"
          placeholder="search a city..."
          value={cityQuery}
          onChange={(e)=>setCityQuery(e.target.value)}
        />
        {suggestions.length>0 && (
          <div className={styles.suggestions}>
            {suggestions.map((city) => (
              <button
                className={styles.suggestion}
                key={`${city.name}-${city.latitude}`}
                onClick={()=>selectCity(city)}
              >
                {city.name}
                {city.region ? `, ${city.region}` : ""}
                {`, ${city.country}`}
              </button>
            ))}
          </div>
        )}
        <p className={styles.date}>{currentDate}</p>
      </header>

      <section className={styles.experience}>
        <h1 className={styles.cityTitle}>
          {selectedCity.toUpperCase()}
        </h1>

        <div className={styles.weatherLayout}>
          <div className={styles.weatherLeft}>
            <p className={styles.condition}>
              {weather ? weather.condition : error || "loading..."}
            </p>
            <div className={styles.detail}>
                <span>FEELS LIKE</span>
                <strong>
                  {weather
                    ? `${Math.round(weather.feels_like * 9/5 + 32)}°`
                    : "--"}
                </strong>
            </div>

            <div className={styles.detail}>
                <span>HIGH</span>
                <strong>
                  {weather
                  ? `${Math.round(weather.high * 9/5 + 32)}°`
                  : "--"}
                </strong>
            </div>

            <div className={styles.detail}>
                <span>LOW</span>
                <strong>
                  {weather
                    ? `${Math.round(weather.low * 9/5 + 32)}°`
                    : "--"}
                </strong>
            </div>
          </div>

          <div className={styles.globe}>
            <div className={styles.globeGlass}>
              <div
                className={`${styles.globeSky} ${
                  weather?.lighting === "day" ? styles.day : styles.night
                } ${
                  weather?.scene === "rain" ||
                  weather?.scene === "thunderstorm"
                    ? styles.stormy
                    : weather?.scene === "snow"
                    ? styles.snowy
                    : weather?.scene === "fog"
                    ? styles.foggy
                    : weather?.scene === "cloudy"
                    ? styles.overcast
                    : weather?.scene === "partly_cloudy"
                    ? styles.partlyCloudy
                    : styles.clearSky
                }`}
              >
                {weather?.lighting === "night" && (
                  <div className={styles.moon}/>
                )}
                
                {weather?.effects.stars&& (
                  <div className={styles.stars}>✦ · ✧ · ✦</div>
                )}
              </div>

              {weather?.effects.clouds && (
                <div className={styles.clouds}/>
              )}

              {weather?.effects.rain && (
                <div className={styles.rain}/>
              )}

              {weather?.effects.snow && (
                <div className={styles.snow}/>
              )}
              {weather?.effects.fog && (
                <div className={styles.fog}/>
              )}
              {weather?.effects.sunlight && (
                <div className={styles.sunlight}/>
              )}

              <div className={styles.globeLandscape}>
                <div className={styles.mountain}/>
                <div className={styles.snowGround}/>
              </div>
            </div>

            <div className={styles.globeNeck}/>
            <div className={styles.globeBase}>
              <div className={styles.baseHighlight}/>
            </div>
          </div>

          <div className={styles.weatherRight}>
              <p className={styles.temperature}>
                  {weather
                    ? `${Math.round(weather.temperature*9/5+32)}°`
                    : "--°"}
              </p>
              <p className={styles.temperatureLabel}>FAHRENHEIT</p>
          </div>
        </div>
      </section>
    </main>
  );
}