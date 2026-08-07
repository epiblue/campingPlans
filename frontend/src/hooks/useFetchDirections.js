import { useState, useEffect } from 'react';
import { getDirections } from '@/services/directionsService';

export const useFetchDirections = (origin, destination, setRouteDataProp, setIsLoading) => {
    useEffect(() => {
        const fetchRoute = async () => {
            if (origin && destination) {
                setIsLoading(true);
                try {
                    const profile = 'walking';
                    const directions = await getDirections(origin, destination, profile);

                    if (directions && directions.routes && directions.routes.length > 0) {
                        // Store the full route object, not just its geometry                                                                                                                                                                    
                        setRouteDataProp(directions.routes[0]);
                    } else {
                        setRouteDataProp(null);
                        console.warn("No route found for the given origin and destination.");
                    }
                } catch (error) {
                    console.error("Error fetching directions:", error);
                    setRouteDataProp(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Clear route if origin or destination is missing                                                                                                                                                                               
                setRouteDataProp(null);
            }
        };

        fetchRoute();
    }, [origin, destination, setRouteDataProp, setIsLoading]);
}; 