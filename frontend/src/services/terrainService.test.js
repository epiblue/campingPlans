import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTerrainGeoJson } from './terrainService';

describe('terrainService', () => {
    const mockGeoJsonData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { area: 'camping', id: 'c1', zoneName: 'Camping Area 1' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
                },
            },
            {
                type: 'Feature',
                properties: { area: 'camping', id: 'c2', zoneName: 'Camping Area 2' },
                // Intentionally invalid geometry for centroid calculation test                                                                                            
                geometry: {
                    type: 'Point',
                    coordinates: [5, 5],
                },
            },
            {
                type: 'Feature',
                properties: { area: 'restaurant', id: 'r1', zoneName: 'Restaurant 1' },
                geometry: {
                    type: 'Point',
                    coordinates: [0.5, 0.5],
                },
            },
            {
                type: 'Feature',
                properties: { area: 'wc', id: 'wc1', zoneName: 'WC 1' },
                geometry: { type: 'Point', coordinates: [1.0, 1.0] },
            },
            {
                type: 'Feature',
                properties: { area: 'pool', id: 'p1', zoneName: 'Pool 1' },
                geometry: { type: 'Point', coordinates: [2.0, 2.0] },
            },
            {
                type: 'Feature',
                properties: { area: 'sport', id: 's1', zoneName: 'Sport Area 1' },
                geometry: { type: 'Point', coordinates: [3.0, 3.0] },
            },
            {
                type: 'Feature',
                properties: { area: 'reception', id: 'rec1', zoneName: 'Reception' },
                geometry: { type: 'Point', coordinates: [4.0, 4.0] },
            },
            {
                type: 'Feature',
                properties: { area: 'parking', id: 'park1', zoneName: 'Parking 1' },
                geometry: { type: 'Point', coordinates: [5.0, 5.0] },
            },
            {
                type: 'Feature',
                properties: { area: 'kids', id: 'kids1', zoneName: 'Playground 1' },
                geometry: { type: 'Point', coordinates: [6.0, 6.0] },
            },
            {
                type: 'Feature',
                properties: { area: 'pet_friendly', id: 'pet1', zoneName: 'Pet Area 1' },
                geometry: { type: 'Polygon', coordinates: [[[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]] },
            },
            {
                type: 'Feature',
                properties: { type: 'bungalow', id: 'b1', zoneName: 'Bungalow 1' },
                geometry: { type: 'Point', coordinates: [7.0, 7.0] },
            },
            {
                type: 'Feature',
                properties: { center: 1, zoneId: 'zoneA', id: 'mainZ', zoneName: 'Main Zone' },
                geometry: {
                    type: 'Point',
                    coordinates: [10, 20],
                },
            },
        ],
    };

    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        // Mock fetch API                                                                                                                                              
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockGeoJsonData),
            })
        );
        // Spy on console.warn and console.error                                                                                                                       
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllMocks();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should successfully fetch and process GeoJSON data', async () => {
        const registryCode = 'someCode';
        const result = await fetchTerrainGeoJson(registryCode);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/mocks/camping_las_dunas.geojson'); // Default path                                                                 
        expect(result.rawGeoJson).toEqual(mockGeoJsonData);

        // Expect campingAreas to have centroids                                                                                                                       
        expect(result.campingAreas.length).toBe(2); // Now includes c1 (polygon) and c2 (point)                                                                        
        expect(result.campingAreas[0].properties).toHaveProperty('centroid_lon');
        expect(result.campingAreas[0].properties).toHaveProperty('centroid_lat');
        expect(result.campingAreas[0].properties.centroid_lon).toBeCloseTo(0.4); // (0+0+1+1+0)/5 = 0.4                                                                
        expect(result.campingAreas[0].properties.centroid_lat).toBeCloseTo(0.4); // (0+1+1+0+0)/5 = 0.4                                                                

        expect(result.zoneRestaurants.length).toBe(1);
        expect(result.zoneRestaurants[0].properties.id).toBe('r1');

        // Assertions for other filtered arrays                                                                                                                        
        expect(result.zoneWcs.length).toBe(1);
        expect(result.zoneWcs[0].properties.id).toBe('wc1');

        expect(result.zonePools.length).toBe(1);
        expect(result.zonePools[0].properties.id).toBe('p1');

        expect(result.zoneSportAreas.length).toBe(1);
        expect(result.zoneSportAreas[0].properties.id).toBe('s1');

        expect(result.zoneReception.length).toBe(1);
        expect(result.zoneReception[0].properties.id).toBe('rec1');

        expect(result.zoneParkings.length).toBe(1);
        expect(result.zoneParkings[0].properties.id).toBe('park1');

        expect(result.zonePlayGrounds.length).toBe(1);
        expect(result.zonePlayGrounds[0].properties.id).toBe('kids1');

        expect(result.petFriendlyZones.length).toBe(1);
        expect(result.petFriendlyZones[0].properties.id).toBe('pet1');
        expect(result.petFriendlyZones[0].properties).toHaveProperty('centroid_lon'); // Ensure centroid calculated for this polygon                                   
        expect(result.petFriendlyZones[0].properties.centroid_lon).toBeCloseTo(10.4); // (10+10+11+11+10)/5 = 10.4                                                     
        expect(result.petFriendlyZones[0].properties.centroid_lat).toBeCloseTo(10.4); // (10+11+11+10+10)/5 = 10.4                                                     

        expect(result.bungalows.length).toBe(1);
        expect(result.bungalows[0].properties.id).toBe('b1');

        // Test centroid calculation for invalid geometry type (c2 which is a Point)                                                                                   
        expect(result.campingAreas[1].properties).toHaveProperty('centroid_lon', null);
        expect(result.campingAreas[1].properties).toHaveProperty('centroid_lat', null);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid Polygon geometry for centroid calculation.');

        expect(result.zoneInformation).toEqual({
            zone: 'zoneA',
            id: 'mainZ',
            name: 'Main Zone',
            center_lon: 10,
            center_lat: 20
        });

        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    // Additional tests for error handling and GeoJSON processing will be added later                                                                                
});               