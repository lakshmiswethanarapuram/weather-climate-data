import {
  StoreWeatherParams,
  StoreWeatherResult,
  ListWeatherFilesResult,
  WeatherFileItem,
  OpenMeteoRawResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    throw new ApiError("Failed to parse response JSON from server", response.status);
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.detail || `Server error (${response.status})`;
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}

// In-memory / localStorage cache key for client-side storage fallback
const CLIENT_STORAGE_KEY = "weather_explorer_client_files";

function getClientStorageFiles(): Record<string, OpenMeteoRawResponse> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveClientStorageFile(filename: string, content: OpenMeteoRawResponse) {
  if (typeof window === "undefined") return;
  try {
    const current = getClientStorageFiles();
    current[filename] = content;
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

export async function storeWeatherData(
  params: StoreWeatherParams
): Promise<StoreWeatherResult> {
  // 1. Try backend server first
  try {
    const response = await fetch(`${API_BASE_URL}/store-weather-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (response.ok) {
      return await handleResponse<StoreWeatherResult>(response);
    }
  } catch (err) {
    console.info("Backend service unreachable, falling back to direct Open-Meteo API client-side.");
  }

  // 2. Client-side fallback directly to Open-Meteo Archive API
  const openMeteoUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${params.latitude}&longitude=${params.longitude}&start_date=${params.start_date}&end_date=${params.end_date}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&timezone=auto`;
  
  const response = await fetch(openMeteoUrl);
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new ApiError(errData?.reason || `Open-Meteo API Error (${response.status})`);
  }

  const rawData: OpenMeteoRawResponse = await response.json();
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const filename = `weather_${params.latitude}_${params.longitude}_${params.start_date}_${params.end_date}_${timestamp}.json`;

  saveClientStorageFile(filename, rawData);

  return {
    status: "ok",
    file: filename,
  };
}

export async function listWeatherFiles(): Promise<ListWeatherFilesResult> {
  // 1. Try backend server first
  try {
    const response = await fetch(`${API_BASE_URL}/list-weather-files`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      return await handleResponse<ListWeatherFilesResult>(response);
    }
  } catch (err) {
    console.info("Backend service unreachable, listing client-stored weather files.");
  }

  // 2. Client-side fallback
  const clientFiles = getClientStorageFiles();
  const fileItems: WeatherFileItem[] = Object.keys(clientFiles).map((name) => ({
    name,
    size: JSON.stringify(clientFiles[name]).length,
    created_at: new Date().toISOString(),
  }));

  return { files: fileItems.reverse() };
}

export async function getWeatherFileContent(
  filename: string
): Promise<OpenMeteoRawResponse> {
  // 1. Try backend server first
  try {
    const encodedFilename = encodeURIComponent(filename);
    const response = await fetch(`${API_BASE_URL}/weather-file-content/${encodedFilename}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      return await handleResponse<OpenMeteoRawResponse>(response);
    }
  } catch (err) {
    console.info("Backend service unreachable, loading file content from client storage.");
  }

  // 2. Client-side fallback
  const clientFiles = getClientStorageFiles();
  if (clientFiles[filename]) {
    return clientFiles[filename];
  }

  throw new ApiError(`Stored weather file '${filename}' not found.`);
}
