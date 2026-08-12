import {
  StoreWeatherParams,
  StoreWeatherResult,
  ListWeatherFilesResult,
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

export async function storeWeatherData(
  params: StoreWeatherParams
): Promise<StoreWeatherResult> {
  const response = await fetch(`${API_BASE_URL}/store-weather-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return handleResponse<StoreWeatherResult>(response);
}

export async function listWeatherFiles(): Promise<ListWeatherFilesResult> {
  const response = await fetch(`${API_BASE_URL}/list-weather-files`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return handleResponse<ListWeatherFilesResult>(response);
}

export async function getWeatherFileContent(
  filename: string
): Promise<OpenMeteoRawResponse> {
  const encodedFilename = encodeURIComponent(filename);
  const response = await fetch(`${API_BASE_URL}/weather-file-content/${encodedFilename}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return handleResponse<OpenMeteoRawResponse>(response);
}
