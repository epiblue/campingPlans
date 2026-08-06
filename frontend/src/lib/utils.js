import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function handleMapClickLogic(e, mapRef, selectedFeature, setSelectedFeature, interactiveLayerIds, waypointMode = null, setOrigin = null, setDestination = null) {
  console.log('handleMapClick clicked', e);

  if (waypointMode && (setOrigin || setDestination)) {
    if (waypointMode === 'origin' && setOrigin) {
      setOrigin([e.lngLat.lng, e.lngLat.lat]);
    } else if (waypointMode === 'destination' && setDestination) {
      setDestination([e.lngLat.lng, e.lngLat.lat]);
    }
    // Clear any previously selected features if we are in waypoint selection mode                                                                                                                                                               
    if (selectedFeature && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: selectedFeature.source, id: selectedFeature.id },
        { selected: false }
      );
    }
    setSelectedFeature(null); // Deselect any feature when selecting a waypoint                                                                                                                                                                  
    console.log(`Waypoint selected: ${waypointMode}`, e.lngLat);
    return; // Exit function after handling waypoint selection                                                                                                                                                                                   
  }

  // Filter features to only consider those from your interactive layers                                                                                                                                                                         
  const clickedFeatures = e.features && e.features.filter(
    feature => interactiveLayerIds.includes(feature.layer.id)
  );

  console.log('Clicked features', clickedFeatures);

  if (clickedFeatures && clickedFeatures.length > 0) {
    const feature = clickedFeatures[0];
    const featureId = feature.id;
    const sourceId = feature.source;
    // The `featureTitle` is obtained from `feature.properties.title`                                                                                                                                                                            
    const featureTitle = feature.properties?.title;
    const featureBackground = feature.properties?.fill || null;
    const featureComfort = feature.properties?.comfort || null;

    if (featureId === undefined || featureId === null) {
      if (selectedFeature && mapRef.current) {
        mapRef.current.setFeatureState(
          { source: selectedFeature.source, id: selectedFeature.id },
          { selected: false }
        );
      }
      setSelectedFeature(null);
      return;
    }

    // If there was a previously selected feature, reset its state                                                                                                                                                                               
    if (selectedFeature && mapRef.current) {
      mapRef?.current.setFeatureState(
        { source: selectedFeature.source, id: selectedFeature.id },
        { selected: false }
      );
    }

    // Set the state of the newly clicked feature to 'selected'                                                                                                                                                                                  
    if (mapRef.current) {
      mapRef.current?.setFeatureState(
        { source: sourceId, id: featureId },
        { selected: true }
      );
    }
    setSelectedFeature({ id: featureId, source: sourceId, title: featureTitle, color: featureBackground, comfort: featureComfort });
    console.log('Selected feature', selectedFeature);
  } else {
    // If no feature was clicked, deselect any currently selected feature                                                                                                                                                                        
    if (selectedFeature && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: selectedFeature.source, id: selectedFeature.id },
        { selected: false }
      );
    }
    setSelectedFeature(null);
    console.log('Reseted features or non selected');
  }
}    