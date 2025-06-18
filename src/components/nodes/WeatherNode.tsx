import React, { useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

interface WeatherNodeData {
  isRunning?: boolean;
  lastResponse?: WeatherApiResponse;
  lastStatus?: number;
  lastError?: any;
}

interface WeatherApiResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number; // Optional, as it might not always be present
    grnd_level?: number; // Optional
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number; // Optional
  };
  rain?: { // Optional, as rain data might not always be present
    "1h"?: number; // Optional, 1-hour rain volume
    "3h"?: number; // Optional, 3-hour rain volume
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

const WeatherNode: React.FC<NodeProps<WeatherNodeData>> = ({ id, data }) => {
  const { lastResponse, isRunning } = data;

  let displayCity: string = "N/A";
  let displayTemp: number | string = "N/A";
  let weatherDescription: string = "N/A";
  let weatherIconUrl: string = '';

  if (lastResponse) {
    displayCity = lastResponse?.name;
    displayTemp = lastResponse?.main?.temp;
    if (lastResponse?.weather && lastResponse?.weather.length > 0) {
      weatherDescription = lastResponse?.weather[0].description;
      weatherIconUrl = `https://openweathermap.org/img/wn/${lastResponse?.weather[0].icon}@2x.png`;
    }
  }

  const highlightedNodeStyle = {
    padding: '10px 20px', 
    border: isRunning ? '2px solid red' : '1px solid #d3d3d3',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    boxShadow: isRunning ? '0px 0px 0px rgba(255, 0, 0, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 275,
    maxWidth: 275,
  };

  const titleStyle = {
    fontSize: '1em',
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const cityStyle = {
    fontSize: '1.1em', // Slightly smaller
    fontWeight: '600', // Medium bold
    marginBottom: 3, // Less margin
    color: '#333',
  };

  const tempStyle = {
    fontSize: '1.6em',
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 3,
  };

  const descriptionStyle = {
    fontSize: '0.85em',
    fontStyle: 'italic',
    color: '#777',
    textTransform: 'capitalize' as 'capitalize',
    textAlign: 'center' as 'center',
  };

  const iconStyle = {
    width: 40,
    height: 40,
    marginBottom: 5,
  };

  // --- Handle Styles ---
  const handleStyle = {
    background: '#00bcd4',
    height: 10,
    width : 10,
    borderRadius: '50%',
    border: '1px solid #333',
  };

  return (
    <div style={highlightedNodeStyle}>
      <strong style={titleStyle}>
        ☁️ Weather Node
      </strong>
      {weatherIconUrl !== '' && <img src={weatherIconUrl} alt="Weather icon" style={iconStyle} />}
      <div style={cityStyle}>{displayCity}</div>
      <div style={tempStyle}>{displayTemp}°C</div>
      <div style={descriptionStyle}>{weatherDescription}</div>

      <Handle
        style={handleStyle}
        type="target"
        position={Position.Top}
      />
    </div>
  );
};

export default WeatherNode;
