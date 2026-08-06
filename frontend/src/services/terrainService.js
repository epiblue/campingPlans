function calculatePolygonCentroid(geometry) {
    if (geometry.type !== 'Polygon' || !geometry.coordinates || geometry.coordinates.length === 0) {
        console.warn('Invalid Polygon geometry for centroid calculation.');
        return { longitude: null, latitude: null };
    }

    const exteriorRing = geometry.coordinates[0]; // Assuming the first ring is the exterior one                                                                                                                                  
    let sumLon = 0;
    let sumLat = 0;

    for (const coord of exteriorRing) {
        sumLon += coord[0]; // Longitude                                                                                                                                                                                          
        sumLat += coord[1]; // Latitude                                                                                                                                                                                           
    }

    const count = exteriorRing.length; // Includes the closing coordinate                                                                                                                                                         
    return {
        longitude: count > 0 ? sumLon / count : null,
        latitude: count > 0 ? sumLat / count : null
    };
}


export async function fetchTerrainGeoJson(registryCode, dataType = 'processed') {
    try {
        let url;
        if (dataType === 'results') {
            //url = '/mocks/model-results_limit_houses.json';
            url = '/mocks/camping_las_dunas.geojson';
        } else if (dataType === 'limit-size') {
            url = '/mocks/model_results_limit_size.json';
        } else {
            url = '/mocks/camping_las_dunas.geojson';
        }

        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch terrain data: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();

        let campingAreas = [];
        let zoneInformation = null;
        let zoneRestaurants = null;
        let zoneWcs = null;
        let zonePools = null;
        let zoneSportAreas = null;
        let zoneReception = null;
        let zoneParkings = null;
        let zonePlayGrounds = null;
        let petFriendlyZones = null;
        let bungalows = null;

        if (data && Array.isArray(data.features)) {
            campingAreas = data.features.filter(feature => feature.properties.area === 'camping');
            campingAreas.forEach(feature => {
                if (feature.geometry && feature.geometry.type === 'Polygon') {
                    const centroid = calculatePolygonCentroid(feature.geometry);
                    Object.assign(feature.properties, { centroid_lon: centroid.longitude, centroid_lat: centroid.latitude });
                }
            });
            const processedFeatures = data.features.map(feature => {
                // Only calculate centroid if it's a Polygon and has geometry                                                                                                                                                 
                if (feature.geometry && feature.geometry.type === 'Polygon') {
                    const centroid = calculatePolygonCentroid(feature.geometry);
                    // Return a new feature object with updated properties to maintain immutability                                                                                                                           
                    return {
                        ...feature,
                        properties: {
                            ...feature.properties,
                            centroid_lon: centroid.longitude,
                            centroid_lat: centroid.latitude
                        }
                    };
                }
                return feature; // Return feature as is if not a Polygon or no geometry                                                                                                                                       
            });

            zoneRestaurants = processedFeatures.filter(feature => feature.properties.area === 'restaurant');
            zoneWcs = processedFeatures.filter(feature => feature.properties.area === 'wc');
            zonePools = processedFeatures.filter(feature => feature.properties.area === 'pool');
            zoneSportAreas = processedFeatures.filter(feature => feature.properties.area === 'sport');
            zoneReception = processedFeatures.filter(feature => feature.properties.area === 'reception');
            zoneParkings = processedFeatures.filter(feature => feature.properties.area === 'parking');
            zonePlayGrounds = processedFeatures.filter(feature => feature.properties.area === 'kids');
            petFriendlyZones = processedFeatures.filter(feature => feature.properties.area === 'pet_friendly');
            bungalows = processedFeatures.filter(feature => feature.properties.type === 'bungalow');

            if (campingAreas.length > 0) {
                const mainZone = data.features.filter(feature => feature.properties.center === 1);
                const mainZoneProperties = mainZone[0].properties;
                zoneInformation = {
                    zone: mainZoneProperties.zoneId,
                    id: mainZoneProperties.id,
                    name: mainZoneProperties.zoneName,
                    center_lon: mainZone[0].geometry.coordinates[0],
                    center_lat: mainZone[0].geometry.coordinates[1]
                };

                console.log('mainZoneInformation', zoneInformation);
            }
        } else {
            console.warn("Fetched terrain GeoJSON did not contain a valid 'features' array for filtering.");
        }

        return {
            rawGeoJson: data,
            campingAreas: campingAreas,
            zoneInformation: zoneInformation,
            zoneRestaurants: zoneRestaurants,
            zoneWcs: zoneWcs,
            zonePools: zonePools,
            zoneSportAreas: zoneSportAreas,
            zoneReception: zoneReception,
            zoneParkings: zoneParkings,
            zonePlayGrounds: zonePlayGrounds,
            petFriendlyZones: petFriendlyZones,
            bungalows: bungalows
        };

    } catch (error) {
        console.error("Error in fetchTerrainGeoJson:", error);
        throw new Error(`Could not retrieve terrain data: ${error.message}`);
    }
}
