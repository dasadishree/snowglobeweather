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
};

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    );

    async function fetchWeather() {
      try{
        const response = await fetch(
          "http://127.0.0.1:8000/scene?latitude=40.752888&longitude=-73.64725"
        );
        if(!response.ok){
          throw new Error("Could not load weather");
        }
        const data: WeatherData = await response.json();
        setWeather(data);
      } catch(err) {
        setError("weather data unavialbale");
        console.error(err);
      }
    }
    fetchWeather();
  }, []);

  return(
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>SNOWGLOBE</p>
        <p className={styles.date}>{currentDate}</p>
      </header>

      <section className={styles.experience}>
        <div className={styles.location}>
          <p className={styles.eyebrow}>CURRENTLY IN</p>
          <h1>Mineola, NY</h1>
          <p className={styles.condition}>
            {weather ? weather.condition : error || "loading weather..."}
          </p>
        </div>
        
        <div className={styles.globe}>
          <div className={styles.globeGlass}>
            <div
              className={`${styles.globeSky} ${
                weather?.lighting === "day" ? styles.day : styles.night
              } ${
                weather?.scene==="rain" || weather?.scene === "thunderstorm"
                  ? styles.stormy
                  : weather?.scene === "snow"
                  ? styles.snowy
                  : weather?.scene === "fog"
                  ? styles.foggy
                  : weather?.scene === "overcast"
                  ? styles.overcast
                  : weather?.scene === "partly_cloudy"
                  ? styles.partlyCloudy
                  : styles.clearSky
              }
              }`}
            >
              {weather?.lighting === "night" && (
                <div className={styles.moon}/>
              )}

            {weather?.effects.stars && (
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

          <div className={styles.weather}>
            <p className={styles.temperature}>
              {weather 
                ? `${Math.round(weather.temperature*9/5+32)}°` 
                : "--°"}
            </p>
            <p className={styles.feelsLike}>
              FEELS LIKE{" "}
              {weather
              ? `${Math.round(weather.feels_like * 9/5+32)}°`
              : "--"}
            </p>
            <div className={styles.weatherDetails}>
              <div>
                <span>HIGH</span>
                <strong>
                  {weather ? `${Math.round(weather.high*9/5+32)}°`: "--"}
                </strong>
              </div>
              <div>
                <span>LOW</span>
                <strong>
                  {weather ? `${Math.round(weather.low * 9/5 + 32)}°` : "--"}
                </strong>
              </div>
              <div>
                <span>WIND</span>
                <strong>
                  {weather ? `${Math.round(weather.wind_speed*0.621371)} mph` : "--"}
                </strong>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}