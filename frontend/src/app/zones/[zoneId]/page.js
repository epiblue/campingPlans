"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MapBox from "@/components/MapBox/MapBox";
import { Spinner } from "@/components/ui/spinner"
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/AppSidebar/AppSidebar';

import { fetchTerrainGeoJson } from '@/services/terrainService';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { handleMapClickLogic } from '@/lib/utils';
import { comfortSpecificFeatures, directionTranslations, directionTranslationPatterns, maneuverIconMap } from '@/lib/constants';

export default function ZonePage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [zoneId, setZoneId] = useState(null);
    const [zoneName, setZoneName] = useState(null);
    const [zoneData, setZoneData] = useState(null)
    const [areaVisibility, setAreaVisibility] = useState({
        campingAreas: true,
        restaurants: true,
        wcs: true,
        sportAreas: true,
        pools: true,
        receptionAreas: true,
        parkings: true,
        playgrounds: true,
        petFriendlyZones: true,
        showTitles: false
    });
    const [loading, setLoading] = useState("")

    const [originCoords, setOriginCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [isSelectingWaypoints, setIsSelectingWaypoints] = useState(false);
    const [routeData, setRouteData] = useState(null);

    const toggleAreaVisibility = (areaKey) => {
        setAreaVisibility(prev => ({
            ...prev,
            [areaKey]: !prev[areaKey]
        }));
    };

    // Read Query Params
    useEffect(() => {
        if (params && typeof params.then === 'function') {
            params.then(resolvedParams => {
                setZoneId(resolvedParams.zoneId);
            }).catch(error => {
                console.error("Error resolving params:", error);
            });
        } else {
            setZoneId(params.zoneId);
        }
    }, [params]);

    //Read json file and load it
    useEffect(() => {
        if (zoneId) {
            setLoading(true);
            const loadZoneSpecificData = async () => {
                try {
                    const {
                        rawGeoJson,
                        campingAreas,
                        zoneRestaurants,
                        zoneWcs,
                        zonePools,
                        zoneSportAreas,
                        zoneReception,
                        zoneParkings,
                        zonePlayGrounds,
                        petFriendlyZones,
                        bungalows,
                        zoneInformation
                    } = await fetchTerrainGeoJson(zoneId);

                    setZoneData({
                        zoneInfo: zoneInformation,
                        jsonData: rawGeoJson,
                        campingAreas: campingAreas,
                        restaurants: zoneRestaurants,
                        wcs: zoneWcs,
                        pools: zonePools,
                        sportAreas: zoneSportAreas,
                        reception: zoneReception,
                        parkings: zoneParkings,
                        playgrounds: zonePlayGrounds,
                        petFriendlyZones: petFriendlyZones,
                        bungalows: bungalows
                    });

                } catch (error) {
                    console.error(`Error fetching data for zone ${zoneId}:`, error);
                    setZoneData(null);
                } finally {
                    setLoading(false);
                }
            };
            loadZoneSpecificData();
        }
    }, [zoneId, searchParams]);

    console.log('Zone Data', zoneData);
    console.log('Zone Name', zoneName);

    const [selectedFeature, setSelectedFeature] = useState(null); // Added selectedFeature state                                                                                                                                  
    const mapRef = useRef();

    const interactiveLayerIds = [
        'polygon-layer',
        'terrain-layer',
        'restaurants-layer',
        'wcs-layer',
        'sportAreas-layer',
        'pools-layer',
        'receptionAreas-layer',
        'parkings-layer',
        'playgrounds-layer',
        'petFriendlyZones-layer'
    ];

    const handlePlanRouteStart = () => {
        setIsSelectingWaypoints(true);
        setOriginCoords(null);          // Reset origin                                                                                                                                                                                          
        setDestinationCoords(null);     // Reset destination                                                                                                                                                                                     
        setRouteData(null);             // Clear previous route                                                                                                                                                                                  
        setSelectedFeature(null);       // Clear any currently selected map feature                                                                                                                                                              
        if (mapRef.current && selectedFeature) {
            mapRef.current.setFeatureState({ source: selectedFeature.source, id: selectedFeature.id }, { selected: false });
        }
        console.log("Started waypoint selection. Select origin on the map.");
    };

    const handleClearRoute = () => {
        setIsSelectingWaypoints(false);
        setOriginCoords(null);
        setDestinationCoords(null);
        setRouteData(null);
        console.log("Cleared route and stopped waypoint selection.");
    };

    // Wrapper for the utility function, ensuring correct dependencies for useCallback                                                                                                                                            
    const handleMapClick = useCallback((e) => {
        if (isSelectingWaypoints) {
            let waypointModeToPass = null;
            if (!originCoords) {
                waypointModeToPass = 'origin';
            } else if (!destinationCoords) {
                waypointModeToPass = 'destination';
            }

            if (waypointModeToPass) {
                handleMapClickLogic(
                    e,
                    mapRef,
                    null, // No feature selection when in waypoint mode                                                                                                                                                                          
                    () => { }, // No setSelectedFeature when in waypoint mode                                                                                                                                                                     
                    [], // No interactive layers needed for waypoint selection in this specific call                                                                                                                                             
                    waypointModeToPass,
                    setOriginCoords, // Pass parent's setOrigin state setter                                                                                                                                                                     
                    setDestinationCoords // Pass parent's setDestination state setter                                                                                                                                                            
                );
                // No immediate state change here for isSelectingWaypoints or waypointModeToPass.                                                                                                                                                
                // The re-evaluation of dependencies (originCoords, destinationCoords) for the next click                                                                                                                                        
                // will correctly determine the next step in waypoint selection.                                                                                                                                                                 
            } else {
                console.log("Both origin and destination already selected. Deactivating waypoint selection.");
                setIsSelectingWaypoints(false); // Auto-deactivate after both are set                                                                                                                                                            
            }
        } else {
            // Original feature selection logic                                                                                                                                                                                                  
            handleMapClickLogic(e, mapRef, selectedFeature, setSelectedFeature, interactiveLayerIds);
        }
    }, [
        mapRef,
        selectedFeature,
        setSelectedFeature,
        interactiveLayerIds,
        isSelectingWaypoints,
        originCoords, // Dependency for sequential waypoint selection logic                                                                                                                                                                      
        destinationCoords, // Dependency for sequential waypoint selection logic                                                                                                                                                                 
        setOriginCoords,
        setDestinationCoords
    ]);

    return (
        <main className="relative flex flex-col max-h-full h-full min-h-screen">
            {loading ? (
                <div className='absolute -z-1 bg-muted w-full h-full min-h-screen place-content-center place-items-center'>
                    <Spinner className="size-6" />
                    <p>Cargando datos...</p>
                </div>
            ) : (
                zoneData &&
                <div className='flex flex-2 gap-4 mx-auto w-full'>
                    <SidebarProvider>
                        <AppSidebar>
                            <div className='flex flex-col flex-1 p-4'>
                                <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2">Control de Capas</h2>
                                <div className="gap-2 grid grid-cols-2">
                                    {[
                                        { key: 'campingAreas', icon: 'camping', label: 'Áreas de Camping' },
                                        { key: 'restaurants', icon: 'restaurant', label: 'Restaurantes' },
                                        { key: 'wcs', icon: 'wc', label: 'Baños (WCs)' },
                                        { key: 'sportAreas', icon: 'sport', label: 'Áreas Deportivas' },
                                        { key: 'pools', icon: 'pool', label: 'Piscinas' },
                                        { key: 'receptionAreas', icon: 'reception', label: 'Áreas de Recepción' },
                                        { key: 'parkings', icon: 'parking', label: 'Parkings' },
                                        { key: 'playgrounds', icon: 'kids', label: 'Áreas de Juego' },
                                        { key: 'petFriendlyZones', icon: 'pet_friendly', label: 'Zonas Pet Friendly' },
                                    ].map((area) => (
                                        <div key={area.key} className={areaVisibility[area.key] ? 'bg-gray-300 p-4 rounded-md' : 'bg-gray-100 p-4 rounded-md'}>
                                            <label htmlFor={`switch-${area.key}`} className="flex items-center justify-between cursor-pointer">
                                                <div className='flex items-center gap-4'>
                                                    <Image // Replaced img with Image component
                                                        src={`/icons/${area.icon}.svg`}
                                                        alt={area.label}
                                                        className="size-4 invert"
                                                        width={16} // Added required width prop
                                                        height={16} // Added required height prop
                                                    />
                                                    <span>{area.label}</span>
                                                </div>
                                                <Switch
                                                    id={`switch-${area.key}`}
                                                    checked={areaVisibility[area.key]}
                                                    onCheckedChange={() => toggleAreaVisibility(area.key)}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <h2 className="text-lg font-semibold mt-4 mb-2">Control de visualización</h2>
                                <div className="gap-2 grid grid-cols-2">
                                    {[
                                        { key: 'showTitles', label: 'Monstrar titulos' },
                                    ].map((area) => (
                                        <div key={area.key} className={areaVisibility[area.key] ? 'bg-gray-300 p-4 rounded-md' : 'bg-gray-100 p-4 rounded-md'}>
                                            <label htmlFor={`switch-${area.key}`} className="flex items-center justify-between cursor-pointer">
                                                <span>{area.label}</span>
                                                <Switch
                                                    id={`switch-${area.key}`}
                                                    checked={areaVisibility[area.key]}
                                                    onCheckedChange={() => toggleAreaVisibility(area.key)}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <h2 className="text-lg font-semibold mt-4 mb-2">Rutas y Navegación</h2>
                                <div className="flex gap-2 mb-4 flex-col">
                                    <div>
                                        {originCoords && <span className="p-2 border rounded">Origen: {originCoords[0].toFixed(3)}, {originCoords[1].toFixed(3)}</span>}
                                        {destinationCoords && <span className="p-2 border rounded">Destino: {destinationCoords[0].toFixed(3)}, {destinationCoords[1].toFixed(3)}</span>}
                                    </div>
                                    {routeData && (
                                        <div className='mt-4 p-3 border rounded-md bg-green-50'>
                                            <h3 className="text-md font-semibold mb-2">Indicaciones</h3>
                                            <p>Distancia: <b>{(routeData.distance / 1000).toFixed(2)} km</b></p>
                                            <p>Duración: <b>{(routeData.duration / 60).toFixed(0)} minutos</b></p>
                                            {routeData.legs && routeData.legs.length > 0 && (
                                                <div className="mt-2">
                                                    <h4 className="font-semibold">Pasos:</h4>
                                                    <ul className="list-disc list-inside">
                                                        {routeData.legs[0].steps.map((step, index) => {
                                                            let translatedInstruction = step.maneuver.instruction;

                                                            // 1. Try to match against dynamic patterns first                                                                                                                                   
                                                            for (const patternEntry of directionTranslationPatterns) {
                                                                const match = step.maneuver.instruction.match(patternEntry.pattern);
                                                                if (match) {
                                                                    // Replace $1, $2, etc., with captured groups                                                                                                                               
                                                                    translatedInstruction = patternEntry.translation.replace(/\$(\d+)/g, (m, num) => {
                                                                        return directionTranslations[match[parseInt(num)]] || match[parseInt(num)];
                                                                    });
                                                                    break; // Found a pattern match, stop checking other patterns                                                                                                               
                                                                }
                                                            }

                                                            // 2. If no pattern match, try exact lookup                                                                                                                                         
                                                            if (translatedInstruction === step.maneuver.instruction) {
                                                                translatedInstruction = directionTranslations[step.maneuver.instruction] || step.maneuver.instruction;
                                                            }

                                                            return (
                                                                <li key={index} className="text-sm p-2 border-b list-none">
                                                                    {['arrive', 'depart'].includes(step.maneuver.type)
                                                                        ? <Image src={`/icons/${maneuverIconMap[step.maneuver.type] || maneuverIconMap.default}.svg`} alt={step.maneuver.type} width={16} height={16} className="invert inline-block mr-2 align-middle" />
                                                                        : <Image src={`/icons/${maneuverIconMap[step.maneuver.modifier] || maneuverIconMap.default}.svg`} alt={step.maneuver.modifier} width={16} height={16} className="invert inline-block mr-2 align-middle" />
                                                                    }
                                                                    <b>{translatedInstruction}</b>
                                                                    {step.distance > 0 && ` (${(step.distance / 1000).toFixed(2)} km)`}
                                                                    {step.duration > 0 && ` (${(step.duration / 60).toFixed(0)} min)`}
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!isSelectingWaypoints ? (
                                        <Button onClick={handlePlanRouteStart} className="flex-1">
                                            Planear Ruta
                                        </Button>
                                    ) : (
                                        <Button onClick={handleClearRoute} variant="destructive" className="flex-1">
                                            Cancelar Ruta
                                        </Button>
                                    )}
                                </div>
                                {isSelectingWaypoints && !originCoords && (
                                    <div className='rounded-md bg-blue-100 p-3 my-2'>
                                        Haz click en el mapa para seleccionar el **origen**.
                                    </div>
                                )}
                                {isSelectingWaypoints && originCoords && !destinationCoords && (
                                    <div className='rounded-md bg-blue-100 p-3 my-2'>
                                        Haz click en el mapa para seleccionar el **destino**.
                                    </div>
                                )}
                            </div>
                        </AppSidebar>
                        <SidebarInset>
                            <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                                <SidebarTrigger className="-ml-1" />
                                <span>Visualización de <b>{zoneData.zoneInfo.name}</b></span>
                            </header>
                            <div className="flex flex-1 flex-col relative">
                                <MapBox
                                    zoneId={zoneId}
                                    campingAreas={zoneData.campingAreas}
                                    restaurants={zoneData.restaurants}
                                    wcs={zoneData.wcs}
                                    sportAreas={zoneData.sportAreas}
                                    pools={zoneData.pools}
                                    receptionAreas={zoneData.reception}
                                    parkings={zoneData.parkings}
                                    playgrounds={zoneData.playgrounds}
                                    petFriendlyZones={zoneData.petFriendlyZones}
                                    showCampingAreas={areaVisibility.campingAreas}
                                    showRestaurants={areaVisibility.restaurants}
                                    showWcs={areaVisibility.wcs}
                                    showSportAreas={areaVisibility.sportAreas}
                                    showPools={areaVisibility.pools}
                                    showReceptionAreas={areaVisibility.receptionAreas}
                                    showParkings={areaVisibility.parkings}
                                    showPlaygrounds={areaVisibility.playgrounds}
                                    showPetFriendlyZones={areaVisibility.petFriendlyZones}
                                    showTitles={areaVisibility.showTitles}
                                    mapRef={mapRef}
                                    handleMapClick={handleMapClick}
                                    interactiveLayerIds={interactiveLayerIds}
                                    bungalows={zoneData.bungalows}
                                    origin={originCoords} // Pass origin state to MapBox                                                                                                                                                                 
                                    destination={destinationCoords} // Pass destination state to MapBox                                                                                                                                                  
                                    setOrigin={setOriginCoords} // Pass parent's setter to MapBox                                                                                                                                                        
                                    setDestination={setDestinationCoords} // Pass parent's setter to MapBox                                                                                                                                              
                                    routeData={routeData} // Pass routeData to MapBox                                                                                                                                                                    
                                    setRouteData={setRouteData} // Pass setRouteData to MapBox so it can clear it  
                                />
                                <div className={`absolute inset-x-0 bottom-0 bg-white shadow-lg transition-transform duration-300 ease-out                                                                                                   
                                                  ${selectedFeature ? 'translate-y-0' : 'translate-y-full'}                                                                                                                                      
                                                  max-h-[50vh] overflow-y-auto border-t-2 border-gray-200`}>
                                    {selectedFeature ? (
                                        <div className={`relative px-4 pb-16 z-50`}>
                                            <div className='flex flex-col relative'>
                                                <h3 className={`text-lg font-semibold mb-2 p-4 rounded-md mt-2 ${selectedFeature.comfort} ${selectedFeature.comfort && 'text-white'}`}>{selectedFeature.title}</h3>
                                                {comfortSpecificFeatures[selectedFeature.comfort] && <p className="text-gray-700">Información detallada del área seleccionada...</p>}
                                                <Button onClick={() => setSelectedFeature(null)} className="mt-4 absolute right-2 top-1">Cerrar</Button>
                                            </div>
                                            {selectedFeature.comfort && (
                                                <div className={`mt-4`}>
                                                    <h4 className="text-md text-gray-500 font-semibold mb-2">Características</h4>
                                                    <ul className="grid grid-cols-2 gap-2">
                                                        {comfortSpecificFeatures[selectedFeature.comfort]?.map((feature, index) => (
                                                            <li key={index} className="flex items-center gap-2">
                                                                <Image
                                                                    src={`/icons/${feature.icon}.svg`}
                                                                    alt={feature.label}
                                                                    className="invert opacity-25"
                                                                    width={24}
                                                                    height={24}
                                                                />
                                                                <span>{feature.label}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Selecciona un área en el mapa para ver la información.</p>
                                    )}
                                </div>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            )
            }
        </main >
    );
} 