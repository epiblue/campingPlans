"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import NavBar from "@/components/NavBar/NavBar";
import MapBox from "@/components/MapBox/MapBox";
import { Spinner } from "@/components/ui/spinner"
import { Switch } from '@/components/ui/switch';
import { fetchTerrainGeoJson } from '@/services/terrainService';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { handleMapClickLogic } from '@/lib/utils';
import { comfortSpecificFeatures } from '@/lib/constants';

export default function ZonePage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [zoneId, setZoneId] = useState(null);
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
                        bungalows
                    } = await fetchTerrainGeoJson(zoneId);

                    setZoneData({
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

    // Wrapper for the utility function, ensuring correct dependencies for useCallback                                                                                                                                            
    const handleMapClick = useCallback((e) => {
        handleMapClickLogic(e, mapRef, selectedFeature, setSelectedFeature, interactiveLayerIds);
    }, [mapRef, selectedFeature, setSelectedFeature, interactiveLayerIds]);

    return (
        <main className="relative flex flex-col max-h-full h-full min-h-screen">
            <NavBar zoneId={zoneId} />
            {loading ? (
                <div className='absolute -z-1 bg-muted w-full h-full min-h-screen place-content-center place-items-center'>
                    <Spinner className="size-6" />
                    <p>Cargando datos...</p>
                </div>
            ) : (
                zoneData &&
                <div className='flex flex-2 gap-4 mx-auto w-full'>
                    <div className='flex flex-1'>
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
                        />
                    </div>
                    <div className='flex flex-col flex-1 mr-4'>
                        {zoneData.zoneInformation &&
                            <div className='text-left bg-gray-100 border-2 shadow-2xs p-2 rounded-sm'>
                                <p className='flex p-2 border-b-2'>
                                    <span className='flex-1'>Nº catastro </span>
                                    <span>{zoneData.zoneInformation.catastro}</span>
                                </p>
                                <p className='flex p-2'>
                                    <span className='flex-1'>Area </span>
                                    <span>{zoneData.zoneInformation.total_area_ha.toFixed(3)} ha</span>
                                </p>
                            </div>
                        }
                        Control layer
                        <h2 className="text-lg font-semibold mt-4 mb-2">Control de Capas</h2>
                        <div className="gap-2 grid grid-cols-3">
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
                        <div className="gap-2 grid grid-cols-3">
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
                        <div>
                            {selectedFeature ? <>
                                <h2 className="text-lg font-semibold mt-4 mb-2">Información del área</h2>
                                <div className={`border-2 rounded-md p-3 relative ${selectedFeature.comfort ? `${selectedFeature.comfort} text-white` : ''}`}>
                                    <span className="text-lg font-semibold">{selectedFeature.title}</span>
                                    <p className='pt-2'>Si quieres disfrutar tus vacaciones al aire libre, sin prescindir de las comodidades de casa. Los bungalows de Camping Las Dunas te ofrecen lo mejor de los dos mundos</p>
                                    {selectedFeature.comfort && <span className='float-right absolute top-0 right-0 p-3 uppercase font-bold text-3xl'>{selectedFeature.comfort}</span>}
                                    {selectedFeature.comfort && comfortSpecificFeatures[selectedFeature.comfort] && (
                                        <div className='mt-4'>
                                            <h3 className="text-md text-gray-200 font-semibold mb-4 border-b pb-2">Características</h3>
                                            <ul className="grid grid-cols-2 gap-2">
                                                {comfortSpecificFeatures[selectedFeature.comfort].map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <Image
                                                            src={`/icons/${feature.icon}.svg`}
                                                            alt={feature.label}
                                                            className="invert opacity-25"
                                                            width={32}
                                                            height={32}
                                                        />
                                                        <span>{feature.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div></> :
                                <div className='rounded-md bg-green-100 p-3 my-4'>Selecione área en la mapa para obtener información</div>

                            }
                        </div>
                    </div>
                </div>
            )
            }
        </main >
    );
}