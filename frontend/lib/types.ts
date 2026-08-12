export interface StoreWeatherParams {
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
}

export interface StoreWeatherResult {
  status: string;
  file: string;
}

export interface WeatherFileItem {
  name: string;
  size: number;
  created_at: string;
}

export interface ListWeatherFilesResult {
  files: WeatherFileItem[];
}

export interface OpenMeteoDailyUnits {
  time?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
  apparent_temperature_max?: string;
  apparent_temperature_min?: string;
  [key: string]: string | undefined;
}

export interface OpenMeteoDailyData {
  time: string[];
  temperature_2m_max?: (number | null)[];
  temperature_2m_min?: (number | null)[];
  apparent_temperature_max?: (number | null)[];
  apparent_temperature_min?: (number | null)[];
  [key: string]: any;
}

export interface OpenMeteoRawResponse {
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  daily_units?: OpenMeteoDailyUnits;
  daily?: OpenMeteoDailyData;
  [key: string]: any;
}

export interface WeatherDataRow {
  date: string;
  tempMax: number | null;
  tempMin: number | null;
  apparentMax: number | null;
  apparentMin: number | null;
}

export interface ApiErrorResponse {
  status: string;
  message: string;
}
