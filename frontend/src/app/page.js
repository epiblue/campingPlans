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
      <span className='mb-4 text-gray-400 font-light'>Introduzca numero de catastro para empezar.</span>
      <form onSubmit={handleFetchTerrain} className="max-w-md mx-auto w-full">
        <label htmlFor="search" className="block mb-2.5 text-sm font-medium text-gray-700 sr-only">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21         
21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
          </div>
          <input
            type="search"
            id="search"
            className="block w-full p-3 ps-9 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder:text-gray-400"
            placeholder="Nº de Catastro"
            required
            value={registryCode} // ej. "camping_las_dunas" 
            onChange={(e) => setRegistryCode(e.target.value)}
          />
          <button
            type="submit"
            className="absolute end-1.5 bottom-1.5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
          >
            Empezar
          </button>
        </div>
        {loadingTerrain && <p className="mt-2 text-blue-600 text-center">Loading terrain data...</p>}
        {errorTerrain && <p className="mt-2 text-red-600 text-center">Error: {errorTerrain.message}</p>}
      </form>
    </main>
  );
}