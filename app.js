const urlBase = "https://pokeapi.co/api/v2/pokemon";

async function obtenerDatos(endpoint) {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${urlBase}/${endpoint}`.replace(/\/+$/, "");
    console.log("Solicitando:", url);

    const respuesta = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en obtenerDatos:", error);
    throw error;
  }
}
const limitePorPagina = 20;
let paginaActual = 1;
let urlSiguiente = null;
let urlAnterior = null;
const contenedorLista = document.getElementById("contenedor-lista");
const botonAnterior = document.getElementById("boton-anterior");
const botonSiguiente = document.getElementById("boton-siguiente");
const indicadorPagina = document.getElementById("indicador-pagina");
const capaCarga = document.getElementById("capa-carga");
const formularioBusqueda = document.getElementById("formulario-busqueda");
const entradaBusqueda = document.getElementById("entrada-busqueda");
const modal = document.getElementById("modal");
const modalCerrar = document.getElementById("modal-cerrar");
const modalCuerpo = document.getElementById("modal-cuerpo");

async function obtenerJson(url) {
  console.log("Obteniendo JSON de:", url);
  try {
    const data = await obtenerDatos(url);
    return data;
  } catch (error) {
    console.error("Error en obtenerJson:", {
      url,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

function activarCarga(mostrar) {
  try {
    if (!capaCarga) {
      console.error("Elemento capaCarga no encontrado");
      return;
    }

    console.log(
      "Cambiando estado de carga a:",
      mostrar ? "mostrar" : "ocultar"
    );

    if (mostrar) {
      document.body.classList.add("carga-activa");
    } else {
      setTimeout(() => {
        document.body.classList.remove("carga-activa");
      }, 300);
    }

    requestAnimationFrame(() => {
      try {
        if (mostrar) {
          capaCarga.style.display = "grid";

          requestAnimationFrame(() => {
            capaCarga.classList.add("mostrar");
          });

          const onTransitionEnd = () => {
            try {
              capaCarga.style.display = "none";
              capaCarga.removeEventListener("transitionend", onTransitionEnd);
            } catch (e) {
              console.error("Error en el manejador de transición:", e);
              capaCarga.style.display = "none";
            }
          };

          if (capaCarga) {
            capaCarga.addEventListener("transitionend", onTransitionEnd, {
              once: true,
            });
            capaCarga.classList.remove("mostrar");

            setTimeout(() => {
              if (capaCarga && capaCarga.classList.contains("mostrar")) {
                capaCarga.style.display = "none";
                capaCarga.classList.remove("mostrar");
              }
            }, 1000);
          }
        }
      } catch (e) {
        console.error("Error al actualizar el estado de carga:", e);

        if (capaCarga) {
          capaCarga.style.display = "none";
          capaCarga.classList.remove("mostrar");
        }
        document.body.classList.remove("carga-activa");
      }
    });
  } catch (error) {
    console.error("Error en activarCarga:", error);
    if (capaCarga) {
      capaCarga.style.display = "none";
      capaCarga.classList.remove("mostrar");
    }
    document.body.classList.remove("carga-activa");
  }
}

function actualizarControles() {
  if (indicadorPagina) {
    indicadorPagina.textContent = `Página ${paginaActual}`;
  }

  if (botonAnterior) {
    botonAnterior.disabled = paginaActual <= 1;
  }

  if (botonSiguiente) {
    botonSiguiente.disabled = false;
  }

  console.log(`Controles actualizados - Página: ${paginaActual}`);
}

function crearTarjeta(pokemon) {
  const elemento = document.createElement("article");
  elemento.className = "tarjeta";
  elemento.tabIndex = 0;

  const nombreFormateado = pokemon.name;
  const idTexto = `#${String(pokemon.id).padStart(3, "0")}`;
  const imagenUrl =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const cabecera = document.createElement("div");
  cabecera.className = "tarjeta-cabecera";

  const nombre = document.createElement("h3");
  nombre.className = "tarjeta-nombre";
  nombre.textContent = nombreFormateado;

  const id = document.createElement("span");
  id.className = "tarjeta-id";
  id.textContent = idTexto;

  cabecera.appendChild(nombre);
  cabecera.appendChild(id);

  const imagen = document.createElement("img");
  imagen.className = "tarjeta-imagen";
  imagen.loading = "lazy";
  imagen.src = imagenUrl;
  imagen.alt = nombreFormateado;

  const tiposContenedor = document.createElement("div");
  tiposContenedor.className = "tarjeta-tipos";

  if (pokemon.types && Array.isArray(pokemon.types)) {
    pokemon.types.forEach((tipoInfo) => {
      const tipo = tipoInfo.type?.name;
      if (tipo) {
        const span = document.createElement("span");
        span.className = `tipo tipo-${tipo}`;
        span.textContent = tipo;
        tiposContenedor.appendChild(span);
      }
    });
  }

  elemento.appendChild(cabecera);
  elemento.appendChild(imagen);
  elemento.appendChild(tiposContenedor);

  elemento.addEventListener("click", () => abrirModal(pokemon));

  elemento.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      abrirModal(pokemon);
    }
  });

  return elemento;
}

async function cargarLista() {
  console.log("Cargando lista de Pokémon...");
  let data;

  try {
    activarCarga(true);
    if (contenedorLista) contenedorLista.innerHTML = "";

    const offset = (paginaActual - 1) * limitePorPagina;
    const endpoint = `?limit=${limitePorPagina}&offset=${offset}`;

    console.log("Cargando endpoint:", endpoint);
    data = await obtenerDatos(endpoint);

    if (!data || !data.results || !Array.isArray(data.results)) {
      throw new Error("Formato de datos inválido");
    }

    console.log(`Se encontraron ${data.results.length} Pokémon en esta página`);

    const pokemones = [];
    for (const pokemon of data.results) {
      try {
        const pokemonData = await obtenerDatos(pokemon.url);
        if (pokemonData.types && Array.isArray(pokemonData.types)) {
          pokemonData.types = pokemonData.types
            .map((t) => t.type?.name)
            .filter(Boolean);
        }
        pokemones.push(pokemonData);
        console.log(`Cargado: ${pokemonData.name}`);
      } catch (error) {
        console.error("Error cargando detalles de", pokemon.name, error);
      }
    }

    if (pokemones.length === 0) {
      throw new Error("No se pudieron cargar los Pokémon");
    }

    const fragmento = document.createDocumentFragment();

    for (const pokemon of pokemones) {
      try {
        const tarjeta = crearTarjeta(pokemon);
        if (tarjeta) {
          fragmento.appendChild(tarjeta);
        }
      } catch (error) {
        console.error("Error creando tarjeta para", pokemon?.name, error);
      }
    }

    if (contenedorLista) {
      contenedorLista.appendChild(fragmento);
    }

    console.log("Lista cargada correctamente");

    urlSiguiente = data.next;
    urlAnterior = data.previous;
    actualizarControles();
  } catch (error) {
    console.error("Error en cargarLista:", error);
    if (contenedorLista) {
      contenedorLista.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p style="color: #fca5a5; margin-bottom: 1rem;">
            ${
              error.message ||
              "Error al cargar los Pokémon. Por favor recarga la página."
            }
          </p>
          <button onclick="window.location.reload()" class="boton">Recargar</button>
        </div>`;
    }
  } finally {
    activarCarga(false);
  }
}

async function obtenerDetallesPorUrl(url) {
  try {
    if (!url) {
      throw new Error("No se proporcionó una URL");
    }

    console.log(`Obteniendo detalles desde URL: ${url}`);
    const data = await obtenerDatos(url);

    if (!data) {
      throw new Error("No se pudieron obtener los detalles");
    }

    if (data.types && Array.isArray(data.types)) {
      data.types = data.types.map((t) => t.type?.name).filter(Boolean);
    }

    return data;
  } catch (error) {
    console.error("Error en obtenerDetallesPorUrl:", error);
    throw new Error("No se pudieron cargar los detalles del Pokémon");
  }
}

async function obtenerDetallesPorIdONombre(valor) {
  try {
    if (!valor) {
      throw new Error("No se proporcionó un valor de búsqueda");
    }

    console.log(`Buscando Pokémon: ${valor}`);
    const data = await obtenerDatos(valor.toLowerCase());

    if (!data) {
      throw new Error("No se encontró el Pokémon");
    }

    if (data.types && Array.isArray(data.types)) {
      data.types = data.types.map((t) => t.type?.name).filter(Boolean);
    }

    return data;
  } catch (error) {
    console.error("Error en obtenerDetallesPorIdONombre:", error);
    throw new Error(`No se pudo encontrar el Pokémon: ${valor}`);
  }
}

function formatearNumero(n) {
  return String(n).padStart(3, "0");
}

function crearFilaInsignias(titulo, valores) {
  const contenedor = document.createElement("div");
  contenedor.className = "fila";

  if (titulo) {
    const tituloElemento = document.createElement("h4");
    tituloElemento.textContent = titulo;
    contenedor.appendChild(tituloElemento);
  }

  const insigniasContenedor = document.createElement("div");
  insigniasContenedor.className = "insignias-contenedor";

  valores.forEach((v) => {
    const span = document.createElement("span");
    span.className = "insignia";
    span.textContent = v;
    insigniasContenedor.appendChild(span);
  });

  contenedor.appendChild(insigniasContenedor);
  return contenedor;
}

if (modalCerrar) modalCerrar.addEventListener("click", cerrarModal);
if (modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

if (botonAnterior) {
  botonAnterior.addEventListener("click", () => {
    if (paginaActual <= 1) return;
    paginaActual--;
    cargarLista();
  });
}

if (botonSiguiente) {
  botonSiguiente.addEventListener("click", () => {
    paginaActual++;
    cargarLista();
  });
}

if (formularioBusqueda) {
  formularioBusqueda.addEventListener("submit", async (e) => {
    e.preventDefault();
    const busqueda = entradaBusqueda?.value?.trim();

    if (!busqueda) {
      cargarLista();
      return;
    }

    try {
      activarCarga(true);
      contenedorLista.innerHTML = "";

      const pokemon = await obtenerDetallesPorIdONombre(busqueda);

      if (!pokemon) {
        throw new Error(
          `No se encontró ningún Pokémon con el término: ${busqueda}`
        );
      }

      if (pokemon.types && Array.isArray(pokemon.types)) {
        pokemon.types = pokemon.types.map((t) => t.type?.name).filter(Boolean);
      }

      const tarjeta = crearTarjeta(pokemon);
      contenedorLista.appendChild(tarjeta);

      if (botonAnterior) botonAnterior.disabled = true;
      if (botonSiguiente) botonSiguiente.disabled = true;
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      contenedorLista.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p style="color: #fca5a5; margin-bottom: 1rem;">
            ${
              error.message ||
              "Error al buscar el Pokémon. Intenta con otro nombre o ID."
            }
          </p>
          <button onclick="cargarLista()" class="boton">Volver a la lista</button>
        </div>`;
    } finally {
      activarCarga(false);
    }
  });
}

function abrirModal(pokemon) {
  modalCuerpo.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  titulo.className = "modal-titulo";
  modalCuerpo.appendChild(titulo);

  const contenedorInfo = document.createElement("div");
  contenedorInfo.className = "modal-contenedor-info";

  const imagen = document.createElement("img");
  imagen.src =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  imagen.alt = pokemon.name;
  imagen.className = "modal-imagen";
  contenedorInfo.appendChild(imagen);

  const infoBasica = document.createElement("div");
  infoBasica.className = "modal-info-basica";

  const idTexto = document.createElement("p");
  idTexto.className = "modal-id";
  idTexto.textContent = `#${String(pokemon.id).padStart(3, "0")}`;
  infoBasica.appendChild(idTexto);

  if (pokemon.types && Array.isArray(pokemon.types)) {
    const tiposContenedor = document.createElement("div");
    tiposContenedor.className = "modal-tipos";

    const tiposTitulo = document.createElement("h4");
    tiposTitulo.textContent = "Tipos:";
    tiposContenedor.appendChild(tiposTitulo);

    const tiposLista = document.createElement("div");
    tiposLista.className = "tipos-lista";

    pokemon.types.forEach((tipoInfo) => {
      const tipo = tipoInfo.type?.name;
      if (tipo) {
        const span = document.createElement("span");
        span.className = `tipo tipo-${tipo}`;
        span.textContent = tipo;
        tiposLista.appendChild(span);
      }
    });

    tiposContenedor.appendChild(tiposLista);
    infoBasica.appendChild(tiposContenedor);
  }

  const detallesFisicos = document.createElement("div");
  detallesFisicos.className = "modal-detalles-fisicos";

  if (pokemon.height) {
    const altura = document.createElement("p");
    altura.innerHTML = `<strong>Altura:</strong> ${pokemon.height / 10}m`;
    detallesFisicos.appendChild(altura);
  }

  if (pokemon.weight) {
    const peso = document.createElement("p");
    peso.innerHTML = `<strong>Peso:</strong> ${pokemon.weight / 10}kg`;
    detallesFisicos.appendChild(peso);
  }

  infoBasica.appendChild(detallesFisicos);
  contenedorInfo.appendChild(infoBasica);
  modalCuerpo.appendChild(contenedorInfo);

  if (pokemon.stats && Array.isArray(pokemon.stats)) {
    const statsTitulo = document.createElement("h3");
    statsTitulo.textContent = "Estadísticas Base";
    statsTitulo.className = "modal-subtitulo";
    modalCuerpo.appendChild(statsTitulo);

    const statsContenedor = document.createElement("div");
    statsContenedor.className = "modal-stats";

    pokemon.stats.forEach((stat) => {
      const statItem = document.createElement("div");
      statItem.className = "stat-item";

      const statNombre = document.createElement("span");
      statNombre.className = "stat-nombre";
      statNombre.textContent = stat.stat.name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const statValor = document.createElement("span");
      statValor.className = "stat-valor";
      statValor.textContent = stat.base_stat;

      const statBarra = document.createElement("div");
      statBarra.className = "stat-barra";

      const statBarraRelleno = document.createElement("div");
      statBarraRelleno.className = "stat-barra-relleno";
      const ancho = Math.min(100, (stat.base_stat / 255) * 100);
      statBarraRelleno.style.width = `${ancho}%`;

      statBarra.appendChild(statBarraRelleno);

      statItem.appendChild(statNombre);
      statItem.appendChild(statValor);
      statItem.appendChild(statBarra);

      statsContenedor.appendChild(statItem);
    });

    modalCuerpo.appendChild(statsContenedor);
  }

  if (pokemon.moves && pokemon.moves.length > 0) {
    const movimientosTitulo = document.createElement("h3");
    movimientosTitulo.textContent = "Algunos Movimientos";
    movimientosTitulo.className = "modal-subtitulo";
    modalCuerpo.appendChild(movimientosTitulo);

    const movimientosLista = document.createElement("div");
    movimientosLista.className = "modal-movimientos";

    const movimientosMostrar = pokemon.moves.slice(0, 5).map((move) =>
      move.move.name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

    movimientosMostrar.forEach((movimiento) => {
      const span = document.createElement("span");
      span.className = "movimiento";
      span.textContent = movimiento;
      movimientosLista.appendChild(span);
    });

    modalCuerpo.appendChild(movimientosLista);
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    document.getElementById("modal-cerrar").focus();
  }, 100);
}

function cerrarModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM completamente cargado, iniciando aplicación...");
  cargarLista();
});
