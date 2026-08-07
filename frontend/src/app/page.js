
"use client";

import React, { useState } from 'react';
import { fetchTerrainGeoJson } from '@/services/terrainService';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [registryCode, setRegistryCode] = useState('');
  const [campingAreas, setCampingAreas] = useState(null);
  const [loadingTerrain, setLoadingTerrain] = useState(false);
  const [errorTerrain, setErrorTerrain] = useState(null);

  const router = useRouter();

  const handleFetchTerrain = async (event) => {
    event.preventDefault();

    setLoadingTerrain(true);
    setErrorTerrain(null);
    try {
      const { rawGeoJson, campingAreas } = await fetchTerrainGeoJson(registryCode, 'processed');

      console.log("rawGeoJson", rawGeoJson);
      console.log("camping areas", campingAreas);

      if (campingAreas) {
        //const catastroCode = terrainFeatures[0].properties.catastro;                                                                                           
        router.push(`/zones/camping_las_dunas`);
      } else {
        throw new Error("Catastro code not found in terrain data.");
      }

    } catch (error) {
      console.error("Error fetching or processing terrain for navigation:", error);
      setErrorTerrain(error);
    } finally {
      setLoadingTerrain(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-800">Bienvenido</h1>
      <span className='mb-4 text-gray-400 font-light'>Seleccione el camping que quiere ver</span>
      <form onSubmit={handleFetchTerrain} className="max-w-md mx-auto w-full">
        <label htmlFor="search" className="block mb-2.5 text-sm font-medium text-gray-700 sr-only">Search</label>
        <div
          id="camping-las-dunas-selection" // Un ID único para el div                                                                                            
          className="block w-full p-3 ps-9 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg shadow-sm cursor-pointer hover:bg-gray-100         
focus:ring-blue-500 focus:border-blue-500" // Se mantienen la mayoría de los estilos del input original, añadiendo cursor-pointer y hover                        
          onClick={() => router.push(`/zones/camping_las_dunas`)}
        >
          Camping Las Dunas
        </div>
        {loadingTerrain && <p className="mt-2 text-blue-600 text-center">Loading terrain data...</p>}
        {errorTerrain && <p className="mt-2 text-red-600 text-center">Error: {errorTerrain.message}</p>}
      </form>
    </main>
  );
}  