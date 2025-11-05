const GET_LOCATION = `https://photon.komoot.io/api/?q=`;

export const fetchPhoton = async (query: string) => {
  if (!query) return [];
  try {
    const res = await fetch(`${GET_LOCATION}${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.features; // array of locations
  } catch (err) {
    console.log('Photon fetch error:', err);
    return [];
  }
};
