import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function handleMapClickLogic(e, mapRef, selectedFeature, setSelectedFeature, interactiveLayerIds, waypointMode = null, setOrigin = null, setDestination = null) {
  if (waypointMode && (setOrigin || setDestination)) {
    if (waypointMode === 'origin' && setOrigin) {
      setOrigin([e.lngLat.lng, e.lngLat.lat]);
    } else if (waypointMode === 'destination' && setDestination) {
      setDestination([e.lngLat.lng, e.lngLat.lat]);
    }
    if (selectedFeature && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: selectedFeature.source, id: selectedFeature.id },
        { selected: false }
      );
    }
    setSelectedFeature(null);
    console.log(`Waypoint selected: ${waypointMode}`, e.lngLat);
    return;
  }

  const clickedFeatures = e.features && e.features.filter(
    feature => interactiveLayerIds.includes(feature.layer.id)
  );

  if (clickedFeatures && clickedFeatures.length > 0) {
    const feature = clickedFeatures[0];
    const featureId = feature.id;
    const sourceId = feature.source;
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

    if (selectedFeature && mapRef.current) {
      mapRef?.current.setFeatureState(
        { source: selectedFeature.source, id: selectedFeature.id },
        { selected: false }
      );
    }

    if (mapRef.current) {
      mapRef.current?.setFeatureState(
        { source: sourceId, id: featureId },
        { selected: true }
      );
    }
    setSelectedFeature({ id: featureId, source: sourceId, title: featureTitle, color: featureBackground, comfort: featureComfort });
    console.log('Selected feature', selectedFeature);
  } else {
    if (selectedFeature && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: selectedFeature.source, id: selectedFeature.id },
        { selected: false }
      );
    }
    setSelectedFeature(null);
  }
}    