# Pokédex

Aplicación web que consume PokeAPI para mostrar información detallada de Pokémon, implementada con tecnologías web estándar.

## Características

- Búsqueda de Pokémon por nombre o ID
- Paginación de resultados con navegación intuitiva
- Visualización en tarjetas con imágenes oficiales y tipos
- Modal detallado con información completa
- Diseño responsive y adaptativo
- Interfaz de usuario intuitiva y moderna

## Estructura del Proyecto

```
PokeApi/
├── index.html         # Punto de entrada de la aplicación
├── styles.css        # Estilos CSS con diseño responsive
├── app.js            # Lógica principal de la aplicación
└── README.md         # Documentación del proyecto
```

### Descripción de Archivos

- **index.html**
  - Estructura base de la aplicación
  - Contenedores principales para la interfaz de usuario
  - Formulario de búsqueda
  - Sección de resultados
  - Modal para detalles del Pokémon

- **styles.css**
  - Estilos globales y reset
  - Diseño responsive con media queries
  - Animaciones y transiciones
  - Estilos para tarjetas y modal
  - Temas de colores basados en tipos de Pokémon

- **app.js**
  - Consumo de PokeAPI
  - Manejo de eventos de búsqueda y paginación
  - Renderizado dinámico de la interfaz
  - Gestión del estado de la aplicación
  - Lógica del modal de detalles

## Requisitos Técnicos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet para consumir PokeAPI
- No se requieren dependencias externas

## Instalación

1. Clonar el repositorio:
   ```
   git clone <url-del-repositorio>
   ```

2. Abrir el archivo `index.html` en cualquier navegador web.

## Uso

1. Ingresar el nombre o número del Pokémon en el campo de búsqueda
2. Presionar Enter o hacer clic en el botón de búsqueda
3. Navegar entre los resultados usando la paginación
4. Hacer clic en cualquier tarjeta para ver información detallada
5. Cerrar el modal haciendo clic fuera de él o presionando Escape

## API Utilizada

La aplicación consume datos de [PokeAPI](https://pokeapi.co/), una API RESTful para información detallada de Pokémon.

## Limitaciones

- Requiere conexión a Internet para cargar los datos
- La búsqueda es sensible a mayúsculas/minúsculas
- Algunos Pokémon pueden no estar disponibles en la API

## Tecnologías

- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- JavaScript Vanilla (ES6+)
- Fetch API para peticiones HTTP
- LocalStorage para almacenamiento local

