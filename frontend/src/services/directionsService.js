export async function getDirections(origin, destination, profile = 'walking') {
  if (!origin || !destination) {
    console.error('Origin and destination are required to fetch directions.');
    return null;
  }

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Mapbox access token is not set. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.');
    return null;
  }

  const query = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${query}?geometries=geojson&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Mapbox Directions API error: ${response.status} ${response.statusText} - ${errorData.message}`);
    }
    const data = await response.json();
    console.log('Directions api response data: ', data);
    return data; // Return the GeoJSON LineString                                                                                                                                                               
  } catch (error) {
    console.error("Error fetching directions:", error);
    return null;
  }
}  