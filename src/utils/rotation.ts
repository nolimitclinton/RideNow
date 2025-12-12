export type LatLng = { latitude: number; longitude: number };

export const calculateBearing = (start: LatLng, end: LatLng): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startLat = toRad(start.latitude);
  const startLng = toRad(start.longitude);
  const endLat = toRad(end.latitude);
  const endLng = toRad(end.longitude);

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
};

export const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;

export const getShortestRotation = (from: number, to: number): number => {
  const delta = ((to - from + 540) % 360) - 180;
  return from + delta;
};
