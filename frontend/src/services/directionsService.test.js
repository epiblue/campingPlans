import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDirections } from './directionsService'; // Adjusted path for same directory                                                                           

describe('directionsService', () => {
    const mockOrigin = [10.0, 20.0];
    const mockDestination = [10.1, 20.1];
    const mockAccessToken = 'pk.mock_access_token';
    const mockApiResponse = {
        routes: [
            {
                geometry: {
                    coordinates: [[10, 20], [10.05, 20.05], [10.1, 20.1]],
                    type: 'LineString',
                },
                legs: [{
                    steps: [
                        { maneuver: { instruction: 'Start walking' } },
                        { maneuver: { instruction: 'Turn right' } }
                    ]
                }]
            },
        ],
        code: 'Ok',
    };

    let consoleErrorSpy;

    beforeEach(() => {
        // Mock environment variable                                                                                                                                   
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = mockAccessToken;
        // Mock fetch API                                                                                                                                              
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockApiResponse),
            })
        );
        // Spy on console.error                                                                                                                                        
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Clean up mocks                                                                                                                                              
        vi.clearAllMocks();
        delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        consoleErrorSpy.mockRestore(); // Restore console.error to its original implementation                                                                         
    });

    it('should successfully fetch directions data for valid origin and destination', async () => {
        const data = await getDirections(mockOrigin, mockDestination);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining(`https://api.mapbox.com/directions/v5/mapbox/walking/${mockOrigin[0]},${mockOrigin[1]};${mockDestination[0]},${mockDestination[1]}?geometries=geojson&steps=true&language=es&access_token=${mockAccessToken}`)
        );
        expect(data).toEqual(mockApiResponse);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle API errors and return null', async () => {
        // Modify fetch mock to simulate an API error response                                                                                                         
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({ message: 'Invalid input' }),
            })
        );

        const data = await getDirections(mockOrigin, mockDestination);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(data).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error fetching directions:',
            expect.any(Error)
        );
        expect(consoleErrorSpy.mock.calls[0][1].message).toContain('Mapbox Directions API error: 400 Bad Request - Invalid input');
    });

    it('should return null and log an error if access token is missing', async () => {
        delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN; // Simulate missing token                                                                                  

        const data = await getDirections(mockOrigin, mockDestination);

        expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called if token is missing                                                                 
        expect(data).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Mapbox access token is not set. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.'
        );
    });

    it('should return null and log an error if origin or destination is missing', async () => {
        // Test missing origin                                                                                                                                         
        let data = await getDirections(null, mockDestination);
        expect(global.fetch).not.toHaveBeenCalled();
        expect(data).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Origin and destination are required to fetch directions.'
        );
        consoleErrorSpy.mockClear(); // Clear the spy for the next assertion                                                                                           

        // Test missing destination                                                                                                                                    
        data = await getDirections(mockOrigin, null);
        expect(global.fetch).not.toHaveBeenCalled();
        expect(data).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Origin and destination are required to fetch directions.'
        );
    });
});   