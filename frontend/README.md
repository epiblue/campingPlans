# Optimizador de Zonas de Terreno

## Objetivo del Proyecto

Esta mini-aplicación está diseñada para explorar zonas de terreno, visualizar datos geográficos, configurar parámetros de optimización y simular la generación de edificios basándose en un "Nº de Catastro". Permite a los usuarios interactuar con información geográfica, definir restricciones de construcción, añadir puntos de interés y simular la ubicación óptima de edificios dentro de una zona determinada.

## Características Principales

* **Búsqueda de Zonas:** Los usuarios pueden introducir un "Nº de Catastro" para encontrar y acceder a zonas de terreno específicas.
* **Visualización Geoespacial:** Muestra datos geográficos del terreno (GeoJSON) y características de edificios generados en un mapa interactivo de MapBox.
* **Visualización de Información de Zona:** Muestra datos clave de la zona seleccionada, como el código catastral, el área total y el estado de procesamiento.
* **Configuración de Optimización:** Proporciona controles para establecer parámetros para la generación de edificios, incluyendo:
  * Límites de tamaño de las viviendas (ancho y alto mínimo/máximo, o dimensiones fijas).
  * Rango para el número de viviendas.
  * Número de bloques (viviendas).
  * Distancia mínima adicional entre elementos.
  * Tipología de edificio (ej. "bloquePlurifamiliar").
* **Gestión de Puntos de Interés (POI):** Los usuarios pueden añadir puntos de interés personalizados en el mapa, asignarles nombres y posteriormente editarlos o eliminarlos.
* **Generación de Simulación:** Activa un proceso de simulación basado en los parámetros configurados y navega para mostrar los resultados generados, incluyendo una lista de datos de edificios individuales (área, plantas, beneficio estimado).
* **Caché del Lado del Cliente:** Implementa un mecanismo de caché para las respuestas de la API con un tiempo de expiración de 1 hora y revalidación.

## Pila Tecnológica

* **Framework Principal:** Next.js
* **Lenguaje:** JavaScript ES6+ (archivos `.js` y `.jsx`)
* **Estilos:** Tailwind CSS
* **Cartografía:** MapBox (integrado a través de un componente personalizado)
* **Gestión de Estado:** React Hooks (`useState`, `useEffect`)
* **Enrutamiento:** Next.js Router (`useRouter`, `useSearchParams`)
* **Componentes UI:** Componentes personalizados para sliders, etiquetas, spinners, etc.

## Cómo Empezar

Siga estas instrucciones para configurar y ejecutar el proyecto localmente.

### Prerrequisitos

 Node.js (se recomienda la versión LTS)

* npm o Yarn
* **Archivo `.env`:**
    Cree un archivo `.env` en la raíz del proyecto con las siguientes variables:

    ```
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="YOUR_API_KEY_HERE"                                                                                                                                                                            
    NEXT_PUBLIC_MAPBOX_STYLE="mapbox://styles/mapbox/satellite-v9"                                                                                                                                                                 
    ```

    Reemplace `"YOUR_API_KEY_HERE"` con su token de acceso de Mapbox. Se necesita registración GRATUITA para la demo.

### Instalación

1. **Clonar el repositorio:**

    ```bash
    git clone <url-de-tu-repositorio>
    cd <directorio-de-tu-proyecto>
    ```

2. **Instalar dependencias:**

    ```bash
    npm install
    # o
    yarn install
    ```

### Ejecutar la Aplicación en Modo desarrollo

Para ejecutar la aplicación en modo de desarrollo:

```bash
npm run dev
# o
yarn dev
```

Esto iniciará el servidor de desarrollo de Next.js, típicamente accesible en `http://localhost:3000`.

## Scripts

El `package.json` incluye los siguientes scripts:

* `start`: Ejecuta la aplicación en modo de desarrollo.
* `build`: Compila la aplicación para producción.
* `test`: Ejecuta las pruebas del proyecto (implementación pendiente si aún no está configurado).
* `lint`: Verifica el estilo del código y posibles problemas usando ESLint.

## Estructura del Proyecto

El código principal de la aplicación reside en el directorio `src/app`, siguiendo las convenciones de enrutamiento de Next.js.

```
.
├── src
│   └── app
│       ├── page.js           # Página de inicio para la entrada del código catastral
│       └── zones
│           └── [zoneId]
│               └── page.js   # Página específica de zona con mapa y configuración
├── components                # Componentes UI reutilizables
├── public                    # Activos estáticos (iconos, mocks)
│   └── icons
│   └── mocks                 # Datos mock de la API
├── services                  # Integraciones de servicios API
└── ...
```

## Vistas

* **Página de Inicio (`/`):** Una página de aterrizaje donde los usuarios pueden introducir un "Nº de Catastro" para comenzar.
* **Página de Detalles de Zona (`/zones/[zoneId]`):** Muestra un mapa interactivo de la zona seleccionada, información de la zona, opciones de configuración de optimización, gestión de puntos de interés y resultados de la simulación.

## Componentes

* **`NavBar`:** Barra de navegación superior, visible en las vistas relevantes.
* **`MapBox`:** Un componente de mapa interactivo que muestra el terreno, características de los edificios y puntos de interés.
* **`Spinner`:** Un componente indicador de carga.
* **`Label`:** Un componente de etiqueta con estilo.
* **`Slider`:** Un componente de slider de rango para establecer límites numéricos.

## Gestión de Datos y Estado

La aplicación utiliza la gestión de estado del lado del cliente con React Hooks. Los datos se obtienen de puntos finales de la API simulados (definidos en `services/terrainService.js`) que simulan diferentes etapas de procesamiento del terreno y resultados del modelo.

## Estilo y Diseño

La aplicación utiliza Tailwind CSS para el estilo, asegurando un diseño consistente y responsivo.

## Linting

ESLint está configurado para mantener un estilo de código consistente e identificar posibles problemas. Se puede ejecutar usando el comando `npm run lint` o `yarn lint`.
