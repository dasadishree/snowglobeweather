from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI(title="Snowglobe weather API")

@app.get("/")
def home():
    return {"message": "Snowglobe weather API is running!"}

@app.get("/weather")
async def get_weather(latitude: float, longitude: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "showers",
            "snowfall",
            "cloud_cover",
            "wind_speed_10m",
            "weather_code"
        ],
        "hourly": [
            "temperature_2m",
            "precipitation_probability",
            "precipitation",
            "rain",
            "snowfall",
            "cloud_cover",
            "weather_code"
        ],
        "daily": [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "sunrise",
            "sunset"
        ],
        "timezone": "auto",
        "forecast_days": 1
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                url,
                params=params,
                timeout=15.0
            )
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError:
            raise HTTPException(
                status_code=502,
                detail="Could not retrieve weather data"
            )
        
    return data

# search
@app.get("/geocode")
async def search_city(city: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params={
        "name": city,
        "count": 5,
        "language": "en",
        "format": "json"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                url,
                params=params,
                timeout=15.0
            )
            response.raise_for_status()
            data=response.json()
        except httpx.HTTPError:
            raise HTTPException(
                status_code=502,
                detail="Could not search for location"
            )
    results=data.get("results", [])
    if not results:
        raise HTTPException(
            status_code=404,
            detail="City not found"
        )
    return{
        "results": [
            {
                "name": place["name"],
                "region": place.get("admin1"),
                "country": place.get("country"),
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "timezone": place.get("timezone")
            }
            for place in results
        ]
    }

# weather mapping
def interpret_weather(data):
    current=data["current"]
    code=current["weather_code"]
    is_day=bool(current["is_day"])
    effects = {
        "rain": False,
        "snow": False,
        "clouds": False,
        "fog": False,
        "lightning": False,
        "sunlight": False,
        "stars": not is_day
    }
    if code in [95,96,99]:
        condition="Thunderstorm"
        scene="thunderstorm"
        effects["rain"]=True
        effects["clouds"]=True
        effects["lightning"]=True

    elif code in [71,73,75,77,85,86]:
        condition = "Snow"
        scene = "snow"
        effects["snow"]=True
        effects["clouds"]=True

    elif code in [51,53,55,56,57,
                  61,63,65,66,67,
                  80,81,82]:
        condition="Rain"
        scene="rain"
        effects["rain"] = True
        effects["clouds"] = True

    elif code in [45,48]:
        condition="Fog"
        scene="fog"
        effects["fog"]=True
        effects["clouds"]=True

    elif code==3:
        condition="Overcast"
        scene="cloudy"
        effects["clouds"]=True
    elif code==2:
        condition = "Partly Cloudy"
        scene="partly_cloudy"
        effects["clouds"]=True
        effects["sunlight"]=is_day
    elif code==1:
        condition="Mostly Clear"
        scene="partly_cloudy"
        effects["sunlight"]=is_day
    else:
        condition="Clear"
        scene="clear"
        effects["sunlight"] = is_day
    
    lighting = "day" if is_day else "night"
    return {
        "condition": condition,
        "scene": scene,
        "lighting": lighting,
        "effects": effects
    }

@app.get("/scene")
async def get_scene(latitude: float, longitude: float):
    data=await get_weather(latitude, longitude)
    weather=interpret_weather(data)
    current=data["current"]
    daily=data["daily"]
    return{
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "timezone": data["timezone"]
        },
        "temperature": current["temperature_2m"],
        "feels_like": current["apparent_temperature"],
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "high": daily["temperature_2m_max"][0],
        "low": daily["temperature_2m_min"][0],
        "weather_code": current["weather_code"],
        "condition": weather["condition"],
        "scene": weather["scene"],
        "lighting": weather["lighting"],
        "effects": weather["effects"],
        "precipitation": current["precipitation"],
        "snowfall": current["snowfall"],
        "cloud_cover": current["cloud_cover"],
        "sunrise": daily["sunrise"][0],
        "sunset": daily["sunset"][0],
        "hourly_forecast": [
            {
                "time": hour,
                "temperature": data["hourly"]["temperature_2m"][i],
                "rain_probability": data["hourly"]["precipitation_probability"][i],
                "rain": data["hourly"]["rain"][i],
                "snowfall": data["hourly"]["snowfall"][i],
                "cloud_cover": data["hourly"]["cloud_cover"][i],
                "weather_code": data["hourly"]["weather_code"][i]
            }
            for i, hour in enumerate(data["hourly"]["time"])
        ]
    }