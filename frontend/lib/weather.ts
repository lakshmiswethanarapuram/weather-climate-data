import { OpenMeteoRawResponse, WeatherDataRow } from "./types";

/**
 * Transforms raw Open-Meteo JSON response into clean WeatherDataRow objects
 * suitable for Recharts and paginated rendering.
 * Safely handles missing keys, null values, or mismatched array lengths.
 */
export function transformOpenMeteoData(raw: OpenMeteoRawResponse): WeatherDataRow[] {
  if (!raw || !raw.daily || !Array.isArray(raw.daily.time)) {
    return [];
  }

  const {
    time = [],
    temperature_2m_max = [],
    temperature_2m_min = [],
    apparent_temperature_max = [],
    apparent_temperature_min = [],
  } = raw.daily;

  return time.map((dateStr, idx) => {
    const tempMax = typeof temperature_2m_max[idx] === "number" ? temperature_2m_max[idx] : null;
    const tempMin = typeof temperature_2m_min[idx] === "number" ? temperature_2m_min[idx] : null;
    const apparentMax =
      typeof apparent_temperature_max[idx] === "number" ? apparent_temperature_max[idx] : null;
    const apparentMin =
      typeof apparent_temperature_min[idx] === "number" ? apparent_temperature_min[idx] : null;

    return {
      date: dateStr || `Day ${idx + 1}`,
      tempMax,
      tempMin,
      apparentMax,
      apparentMin,
    };
  });
}

/**
 * Helper to format byte sizes into readable strings.
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Helper to format ISO timestamp strings into local readable date/time.
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return isoString;
  }
}
