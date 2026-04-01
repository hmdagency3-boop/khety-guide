export function isLocationMessage(content: string): boolean {
  return content.includes("📍") && content.includes("maps.google.com/?q=");
}

export function parseLatLon(content: string): { lat: number; lon: number } | null {
  const match = content.match(/maps\.google\.com\/\?q=([-\d.]+),([-\d.]+)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lon)) return null;
  return { lat, lon };
}
