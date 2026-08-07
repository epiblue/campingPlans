# Navegador de Mapas de Campings

Este proyecto es una aplicación diseñada para mostrar planos detallados de áreas de camping, ofreciendo diversas funcionalidades como navegación, información de zonas y direcciones paso a paso.

## Tabla de Contenidos

- [Objetivo del Proyecto](#objetivo-del-proyecto)
- [Pila Tecnológica](#pila-tecnológica)
- [Características Principales](#características-principales)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Primeros Pasos](#primeros-pasos)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación](#instalación)
  - [Ejecutar la Aplicación](#ejecutar-la-aplicación)
- [Scripts](#scripts)
- [Gestión de Datos y Estado](#gestión-de-datos-y-estado)
- [API y Servicios Externos](#api-y-servicios-externos)
- [Cartografía y GeoJSON](#cartografía-y-geojson)
- [Utilidades y Constantes](#utilidades-y-constantes)
- [Estilismo y Diseño](#estilismo-y-diseño)
- [Persistencia / Caché de Datos](#persistencia--caché-de-datos)

## Objetivo del Proyecto

El objetivo principal de esta aplicación es mostrar planos completos de áreas de camping con características interactivas para la navegación, información detallada de zonas y direcciones dentro del área de camping.

## Pila Tecnológica

- **Framework Principal:** Next.js
- **Lenguaje:** JavaScript ES6+ (archivos `.js` y `.jsx`)
- **Cartografía:** `react-map-gl`, `mapbox-gl`
- **Componentes de UI:** `shadcn/ui` (ej., `Button`, `Switch`, `Spinner`, `Drawer`, `Sidebar`)
- **Optimización de Imágenes:** `next/image`
- **Hooks Personalizados:** `useFetchDirections`
- **Estilismo:** Tailwind CSS

## Características Principales

- Muestra mapas detallados de campings con varias áreas (parcelas de camping, restaurantes, WCs, zonas deportivas, piscinas, recepción, aparcamientos, parques infantiles, zonas pet-friendly, bungalows) resaltadas con los iconos correspondientes.
- Los usuarios pueden seleccionar áreas en el mapa para ver información más detallada.
- Proporciona funcionalidad de navegación, permitiendo a los usuarios seleccionar puntos de origen y destino directamente en el mapa para obtener direcciones paso a paso.

## Estructura del Proyecto

El proyecto sigue una estructura estándar de Next.js con directorios dedicados para:

- `src/app`: Rutas y páginas de la aplicación.
- `src/components`: Componentes de UI reutilizables.
- `src/services`: Llamadas a la API y lógica de obtención de datos.
- `src/lib`: Funciones de utilidad y constantes de la aplicación.

## Primeros Pasos

Sigue estas instrucciones para configurar y ejecutar el proyecto localmente.

### Prerrequisitos

- Node.js (v18.x o superior recomendado)
- npm o yarn

### Instalación

1. Clona el repositorio:

    ```bash
    git clone <url-del-repositorio>
    cd <nombre-del-repositorio>
    ```

2. Instala las dependencias:

    ```bash
    npm install
    # o
    yarn install
    ```

3. Configura las Variables de Entorno:
    Crea un archivo `.env.local` en la raíz del proyecto y añade tu Token de Acceso de Mapbox y la URL del Estilo de Mapbox:

    ```dotenv
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=TU_MAPBOX_ACCESS_TOKEN
    NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v11 # O tu URL de estilo preferida
    ```

    Reemplaza `TU_MAPBOX_ACCESS_TOKEN` con tu token de acceso público real de Mapbox.

### Ejecutar la Aplicación

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run START
# o
yarn START
```

Abre tu navegador y navega a `http://localhost:3000/zones/132` (asumiendo que `132` es un `zoneId` válido en tus mocks de datos).

## Scripts

El archivo `package.json` incluye los siguientes scripts:

- `npm run START`: Ejecuta la aplicación en modo desarrollo.
- `npm run BUILD`: Compila la aplicación para producción.
- `npm run TEST`: Ejecuta las pruebas del proyecto. (Actualmente no implementado en el contexto proporcionado)
- `npm run LINT`: Verifica el estilo del código y posibles problemas usando ESLint.

## Gestión de Datos y Estado

- **Estado Local:** Se utilizan `useState` y `useEffect` para gestionar el estado de la UI específico del componente y manejar los efectos secundarios.
- **Memorización:** Se emplean `useCallback` y `useMemo` para optimizar el rendimiento de los manejadores de eventos y los cálculos costosos.
- **Capa de Servicio:** Las llamadas a la API y la lógica de obtención de datos se encapsulan en archivos dedicados dentro del directorio `src/services`. Para la Prueba de Concepto (POC), los datos se recuperan de archivos GeoJSON de mock, simulando una API.

## API y Servicios Externos

- **API de Mapbox:** Las interacciones con la API de Direcciones de Mapbox se gestionan en `src/services/directionsService.js`.
- **Variables de Entorno:** Los secretos accesibles desde el lado del cliente (como los tokens de acceso de Mapbox) se gestionan utilizando variables de entorno prefijadas con `NEXT_PUBLIC_`.
- **Manejo de Errores:** Las funciones del servicio de API incluyen un manejo de errores robusto, generalmente registrando errores con `console.error` y devolviendo `null` o lanzando errores específicos.

## Cartografía y GeoJSON

- **Datos GeoJSON:** La obtención y el procesamiento de datos GeoJSON, incluyendo el cálculo de centroides y el filtrado de características, se gestionan en `src/services/terrainService.js`.
- **Estado de la Característica de Mapbox:** Se utiliza el mecanismo `feature-state` de Mapbox para el estilismo dinámico de las capas de mapas interactivas (ej., resaltando las áreas seleccionadas al hacer clic).
- **Capas Interactivas:** Se definen explícitamente los IDs de las capas interactivas en `interactiveLayerIds` para permitir las interacciones de clic en las características del mapa.
- **Popups:** Se utilizan los componentes `Popup` de Mapbox para mostrar información relacionada con características específicas del mapa al pasar el ratón por encima o seleccionarlas.

## Utilidades y Constantes

El directorio `src/lib` almacena funciones de utilidad de toda la aplicación (ej., `handleMapClickLogic`) y constantes (ej., `comfortSpecificFeatures`, `directionTranslations`, `maneuverIconMap`) para una mejor organización y reutilización.

## Estilismo y Diseño

El estilismo de la aplicación se implementa utilizando clases de Tailwind CSS. El diseño sigue la estructura implícita en las descripciones de las vistas, asegurando un diseño consistente y responsivo.

## Persistencia / Caché de Datos

Se implementa un mecanismo de caché del lado del cliente para las respuestas de la API. Los datos obtenidos se almacenan con un tiempo de caducidad de 1 hora. Después de este período, los datos cacheados se consideran obsoletos y se revalidan mediante una nueva solicitud a la API cuando se necesitan de nuevo. Cualquier método de almacenamiento del lado del cliente adecuado (ej., `localStorage`, `sessionStorage` o una implementación de caché en memoria dentro del estado de la aplicación) puede utilizarse para este propósito.
