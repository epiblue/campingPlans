=======

# Contenido de presentación

### Video

<https://youtu.be/_Qh11Tc2-8w>

### Presentación en slides

<https://docs.google.com/presentation/d/1GC3sn5sCrSza33B3Hv8aL_xvh6_82irzQkHbDFEk4Dc/edit?usp=sharing>

### Aplicación desplegada

<https://camping-plans.vercel.app/>

=======

# Navegador de Mapas de Campings

Este proyecto es una aplicación web construida con Next.js, diseñada para visualizar planos detallados de áreas de camping. Ofrece funcionalidades interactivas
para la navegación, información sobre zonas específicas y la posibilidad de obtener direcciones paso a paso dentro del área de camping.

## Características Principales

* **Mapas Interactivos:** Muestra mapas detallados de campings, con áreas como parcelas, restaurantes, WCs y zonas deportivas resaltadas e iconos
correspondientes.
* **Información Detallada:** Los usuarios pueden seleccionar áreas en el mapa para ver información más específica.
* **Navegación Asistida:** Permite seleccionar puntos de origen y destino en el mapa para generar direcciones detalladas paso a paso.

## Pila Tecnológica

La aplicación está desarrollada con **Next.js** y **JavaScript ES6+** (sin TypeScript). Utiliza **react-map-gl** y **mapbox-gl** para las funcionalidades de mapeo,
**Tailwind CSS** para el estilismo y componentes de **shadcn/ui** para la interfaz de usuario. La gestión de datos simula llamadas a API para archivos GeoJSON y
JSON.

## Estructura del Proyecto

La aplicación principal se encuentra en el directorio `frontend/`. Dentro de `src`, se organiza en `app`, `components`, `services` y `lib`.

## Primeros Pasos

Para obtener instrucciones detalladas sobre cómo configurar y ejecutar el proyecto localmente, consulta el archivo `frontend/README.md`. Allí encontrarás
información sobre los prerrequisitos, la instalación, la configuración de variables de entorno y los comandos para iniciar la aplicación.
