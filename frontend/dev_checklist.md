## Development Checklist

### Initial Service Files

- [x] **Implement `src/services/directionsService.js`**
  - [x] Ensure `getDirections` function is correctly implemented in `src/services/directionsService.js`.
- [x] **Implement `src/services/terrainService.js`**
  - [x] Ensure `fetchTerrainGeoJson` and `calculatePolygonCentroid` functions are correctly implemented in `src/services/terrainService.js`.

### Part 1: Refactor Directions Fetching and Enhance Route Data

- [ ] **Create `src/hooks/useFetchDirections.js`**
  - [ ] Create a new file at `src/hooks/useFetchDirections.js`.
  - [ ] Implement the `useFetchDirections` custom hook in this file. It should encapsulate the `useEffect` logic for fetching directions and managing the `isLoading` state, using `getDirections` from `src/services/directionsService.js`.
  - [ ] **Crucially, the hook should store the *full route object* (e.g., `directions.routes[0]`), not just its geometry, into the `setRouteDataProp` state.**
- [ ] **Update `components/MapBox/MapBox.jsx`**
  - [ ] Remove the existing `useEffect` block responsible for fetching directions.
  - [ ] Remove the direct import of `getDirections` from `MapBox.jsx`.
  - [ ] Import the newly created `useFetchDirections` hook.
  - [ ] Call `useFetchDirections` within the `MapBox` component, passing `origin`, `destination`, `setRouteData`, and `setIsLoading`.
  - [ ] Adjust how `routeData` is used for the `Source` and `Layer` components to correctly access `routeData.geometry` (since `routeData` will now be the full route object).
- [ ] **Enhance `/zoneId/page.js` to Display Route Details**
  - [ ] In `/zoneId/page.js`, utilize the `routeData` state (which will now contain the full route object) to display additional information such as `routeData.distance`, `routeData.duration`, or details from `routeData.legs[0].steps`.
