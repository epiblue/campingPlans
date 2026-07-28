"use client"

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Image from "next/image";
import Map, {
    Marker,
    Source,
    Layer,
    NavigationControl,
    FullscreenControl,
    ScaleControl,
    Popup
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { getDirections } from '@/services/directionsService';

const CustomMarker = ({ color, scale, isEditing }) => {
    return (
        <div
            style={{
                backgroundColor: isEditing ? 'yellow' : color,
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                border: '2px solid white',
                transform: `scale(${scale})`,
                transition: 'transform 0.2s ease-out, background-color 0.2s ease-out',
                cursor: 'pointer',
            }}
        />
    );
};


const MapBox = ({
    jsonData,
    zoneInformation,
    campingAreas,
    restaurants,
    wcs,
    sportAreas,
    pools,
    receptionAreas,
    parkings,
    playgrounds,
    petFriendlyZones,
    showCampingAreas,
    showRestaurants,
    showWcs,
    showSportAreas,
    showPools,
    showReceptionAreas,
    showParkings,
    showPlaygrounds,
    showPetFriendlyZones,
    showTitles,
    mapRef,
    handleMapClick,
    interactiveLayerIds,
    bungalows,
    origin,
    destination,
    setOrigin,
    setDestination,
    routeData,
    setRouteData
}) => {
    const [allData, setAllData] = useState(jsonData);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchRoute = async () => {
            if (origin && destination) {
                setIsLoading(true);
                try {
                    const profile = 'walking'; // Default profile for directions                                                                                                                                                                 
                    const directions = await getDirections(origin, destination, profile);

                    console.log('Directions object received in MapBox:', directions);

                    if (directions && directions.routes && directions.routes.length > 0) {
                        setRouteData(directions.routes[0].geometry); // Update parent's routeData via prop                                                                                                                                       
                    } else {
                        setRouteData(null);
                        console.warn("No route found for the given origin and destination.");
                    }
                } catch (error) {
                    console.error("Error fetching directions:", error);
                    setRouteData(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Clear route if origin or destination is missing                                                                                                                                                                               
                setRouteData(null);
            }
        };

        fetchRoute();
        console.log('Route data mapbox', routeData);

    }, [origin, destination, setRouteData]);

    const data = useMemo(() => {
        return allData;
    }, [allData]);

    const layerStyle = {
        id: 'point',
        type: 'circle',
        paint: {
            'circle-radius': 2,
            'circle-color': '#007cbf'
        }
    };

    const skyLayer = {
        id: 'sky',
        type: 'sky',
        paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    };

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE;

    const [geojsonKey, setGeojsonKey] = useState(1);



    return (
        <div className="flex w-full">
            <div className="flex flex-col w-full min-h-full mt-4">
                <h1 className="text-[24px] font-[550] text-[#1D2939] mb-4 flex">
                    <Image alt="Mapa" src="/icons/mapa.svg" width={24} height={24} className='mr-2 ml-8' /> Mapa del territorio
                </h1>
                <div className="relative overflow-x-auto flex min-h-full h-full mb-4 ">
                    <Map
                        className="w-4/5 h-full min-h-full"
                        mapboxAccessToken={accessToken}
                        initialViewState={{
                            longitude: zoneInformation?.centro_lon || 3.107655,
                            latitude: zoneInformation?.centro_lat || 42.160927,
                            zoom: 15,
                        }}
                        style={{ height: 700 }}
                        mapStyle={mapStyle}
                        ref={mapRef}
                        onClick={handleMapClick}
                        interactiveLayerIds={interactiveLayerIds}
                    // onClick={handleMapClick}

                    >
                        <FullscreenControl position="top-left" />
                        <NavigationControl position="top-left" />
                        <ScaleControl />
                        <Marker longitude={zoneInformation?.centro_lon || "3.107655"} latitude={zoneInformation?.centro_lat || "42.160927"} color="red" />
                        {/* Origin Marker */}
                        {origin && (
                            <Marker longitude={origin[0]} latitude={origin[1]} color="green" />
                        )}

                        {/* Destination Marker */}
                        {destination && (
                            <Marker longitude={destination[0]} latitude={destination[1]} color="blue" />
                        )}
                        <Layer {...skyLayer} />
                        {data && (
                            <Source type="geojson" key={geojsonKey} promoteId="id" data={data}>
                                <Layer
                                    id="polygon-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': '#fff',
                                        'fill-opacity': 0.5,
                                    }}
                                    layout={{
                                        'visibility': 'visible',
                                    }}
                                />
                            </Source>
                        )}
                        {showCampingAreas && campingAreas && campingAreas.length > 0 && (
                            <Source id="terrain-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: campingAreas
                            }}>
                                <Layer
                                    id="terrain-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="terrain-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': ['get', 'stroke'],
                                        'line-width': 4
                                    }}
                                />
                                {campingAreas.map((campingArea, index) => (
                                    <Popup
                                        key={campingArea.properties.id || index}
                                        longitude={campingArea.properties.centroid_lon}
                                        latitude={campingArea.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${campingArea.properties.area}.svg`}
                                                alt={campingArea.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{campingArea.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}
                        {showRestaurants && restaurants && restaurants.length > 0 && (
                            <Source id="restaurants-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: restaurants
                            }}>
                                <Layer
                                    id="restaurants-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="restaurants-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#ffffff',
                                        'line-width': 4
                                    }}
                                />
                                {restaurants.map((restaurant, index) => (
                                    <Popup
                                        key={restaurant.properties.id || index}
                                        longitude={restaurant.properties.centroid_lon}
                                        latitude={restaurant.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${restaurant.properties.area}.svg`}
                                                alt={restaurant.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{restaurant.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}
                        {showWcs && wcs && wcs.length > 0 && (
                            <Source id="wcs-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: wcs
                            }}>
                                <Layer
                                    id="wcs-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="wcs-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#ffffff',
                                        'line-width': 4
                                    }}
                                />
                                {wcs.map((wc, index) => (
                                    <Popup
                                        key={wc.properties.id || index}
                                        longitude={wc.properties.centroid_lon}
                                        latitude={wc.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${wc.properties.area}.svg`}
                                                alt={wc.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{wc.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}

                        {showSportAreas && sportAreas && sportAreas.length > 0 && (
                            <Source id="sportAreas-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: sportAreas
                            }}>
                                <Layer
                                    id="sportAreas-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="sportAreas-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#fff',
                                        'line-width': 4
                                    }}
                                />
                                {sportAreas.map((sport, index) => (
                                    <Popup
                                        key={sport.properties.id || index}
                                        longitude={sport.properties.centroid_lon}
                                        latitude={sport.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${sport.properties.area}.svg`}
                                                alt={sport.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{sport.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}

                        {showPools && pools && pools.length > 0 && (
                            <Source id="pools-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: pools
                            }}>
                                <Layer
                                    id="pools-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="pools-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#fff',
                                        'line-width': 4
                                    }}
                                />
                                {pools.map((pool, index) => (
                                    <Popup
                                        key={pool.properties.id || index}
                                        longitude={pool.properties.centroid_lon}
                                        latitude={pool.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${pool.properties.area}.svg`}
                                                alt={pool.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{pool.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}

                        {showReceptionAreas && receptionAreas && receptionAreas.length > 0 && (
                            <Source id="receptionAreas-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: receptionAreas
                            }}>
                                <Layer
                                    id="receptionAreas-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="receptionAreas-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#fff',
                                        'line-width': 4
                                    }}
                                />
                                {receptionAreas.map((reception, index) => (
                                    <Popup
                                        key={reception.properties.id || index}
                                        longitude={reception.properties.centroid_lon}
                                        latitude={reception.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${reception.properties.area}.svg`}
                                                alt={reception.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{reception.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}

                        {showParkings && parkings && parkings.length > 0 && (
                            <Source id="parkings-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: parkings
                            }}>
                                <Layer
                                    id="parkings-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="parkings-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#fff',
                                        'line-width': 4
                                    }}
                                />
                                {parkings.map((parking, index) => (
                                    <Popup
                                        key={parking.properties.id || index}
                                        longitude={parking.properties.centroid_lon}
                                        latitude={parking.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${parking.properties.area}.svg`}
                                                alt={parking.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{parking.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}

                        {showPlaygrounds && playgrounds && playgrounds.length > 0 && (
                            <Source id="playgrounds-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: playgrounds
                            }}>
                                <Layer
                                    id="playgrounds-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="playgrounds-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#fff',
                                        'line-width': 4
                                    }}
                                />
                                {playgrounds.map((playground, index) => (
                                    <Popup
                                        key={playground.properties.id || index}
                                        longitude={playground.properties.centroid_lon}
                                        latitude={playground.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${playground.properties.area}.svg`}
                                                alt={playground.properties.area}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{playground.properties.title}</span>}
                                        </div>
                                    </Popup>
                                ))}
                            </Source>
                        )}
                        {showPetFriendlyZones && petFriendlyZones && petFriendlyZones.length > 0 && (
                            <Source id="petFriendlyZones-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: petFriendlyZones
                            }}>
                                <Layer
                                    id="petFriendlyZones-layer"
                                    type="fill"
                                    paint={{
                                        'fill-color': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            '#FFFF00', // Color when selected                                                                                                                                                     
                                            ['get', 'fill'] // Original color from properties                                                                                                                                     
                                        ],
                                        'fill-opacity': [
                                            'case',
                                            ['boolean', ['feature-state', 'selected'], false],
                                            0.8, // Opacity when selected                                                                                                                                                         
                                            0.7 // Original opacity                                                                                                                                                               
                                        ]
                                    }}
                                    interactive={true}
                                />
                                <Layer
                                    id="petFriendlyZones-border-layer"
                                    type="line"
                                    paint={{
                                        'line-color': 'red',
                                        'line-width': 4
                                    }}
                                />
                                {petFriendlyZones.map((petFriendlyZone, index) => (<div key={petFriendlyZone.properties.id}>
                                    <Popup
                                        key={petFriendlyZone.properties.id || index}
                                        longitude={petFriendlyZone.properties.centroid_lon}
                                        latitude={petFriendlyZone.properties.centroid_lat}
                                        anchor="bottom"
                                        offset={0}
                                        closeButton={false}
                                        closeOnClick={false}
                                    >
                                        <div className="text-sm font-semibold text-gray-800 p-1">
                                            <Image
                                                src={`/icons/${petFriendlyZone.properties.area}.svg`}
                                                alt={petFriendlyZone.properties.title || 'petarea'}
                                                className="inline-block mr-1 invert"
                                                width={32}
                                                height={32}
                                            />
                                            {showTitles && <span>{petFriendlyZone.properties.title}</span>}
                                        </div>
                                    </Popup>
                                </div>))}
                            </Source>
                        )}
                        {bungalows && bungalows.length > 0 && (
                            <Source id="bungalows-source" type="geojson" promoteId="id" data={{
                                type: 'FeatureCollection',
                                features: bungalows
                            }}>
                                <Layer
                                    id="bungalows-layer"
                                    minzoom={17}
                                    type="fill-extrusion"
                                    paint={{
                                        'fill-extrusion-color': '#d1d5dc', // Static color (example, choose one that fits)                                                                                                         
                                        'fill-extrusion-height': 3,       // Static height                                                                                                                                        
                                        'fill-extrusion-base': 0,         // Static base height                                                                                                                                   
                                        'fill-extrusion-opacity': 1      // Static opacity                                                                                                                                       
                                    }}
                                    interactive={true}
                                />
                                {bungalows.map((bungalow, index) => (<div key={index}>
                                    <Layer
                                        id={`biungalows-labels-${bungalow.properties.type}`}
                                        type="symbol"
                                        minzoom={17}
                                        source="bungalows-source"
                                        layout={{
                                            'text-field': ['get', 'title'],
                                            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                            'text-size': 18,
                                            'text-anchor': 'top',
                                            'text-offset': [0, -1.5],
                                            'text-pitch-alignment': 'map',
                                            'text-rotation-alignment': 'map',
                                        }}
                                        paint={{
                                            'text-color': '#000',
                                            'text-halo-color': '#ffffff',
                                            'text-halo-width': 1,
                                        }}
                                    />
                                </div>))}
                            </Source>
                        )}
                        {/* Navigation layer*/}
                        {routeData && (
                            <Source id="directions-route-source" type="geojson" data={{
                                type: 'Feature',
                                geometry: routeData
                            }} />
                        )}
                        {routeData && (
                            <Layer
                                id="directions-route-layer"
                                type="line"
                                source="directions-route-source"
                                paint={{
                                    'line-color': '#007cbf',
                                    'line-width': 4
                                }}
                            />
                        )}
                    </Map>
                </div>
            </div>
        </div >
    );
}

MapBox.propTypes = {
    LegendImage: PropTypes.string,
    jsonData: PropTypes.object,
    overlayCords: PropTypes.array,
    processedData: PropTypes.array,
    availableImages: PropTypes.array,
    jsonClusters: PropTypes.object,
    zoneId: PropTypes.string,
    pointsOfInterest: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
    })),
    onNewPOIMarkerAdded: PropTypes.func,
    editingPOIId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    origin: PropTypes.arrayOf(PropTypes.number),
    destination: PropTypes.arrayOf(PropTypes.number),
    routeData: PropTypes.object,
    setOrigin: PropTypes.func,
    setDestination: PropTypes.func,
    setRouteData: PropTypes.func,
};

MapBox.defaultProps = {
    LegendImage: "/data/zonas/132/legend_ndvi.png",
    jsonData: { type: 'FeatureCollection', features: [] },
    overlayCords: [],
    processedData: [],
    availableImages: [],
    jsonClusters: { type: 'FeatureCollection', features: [] },
    zoneId: null,
    origin: null,
    destination: null,
    routeData: null,
    setOrigin: () => { },
    setDestination: () => { },
    setRouteData: () => { },
};

export default MapBox;