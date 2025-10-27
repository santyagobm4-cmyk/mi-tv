// ===================================
// CONFIGURACIÓN DE LISTAS M3U
// ===================================
const paises = {
    // ⭐️ TUS LISTAS DE GITHUB
    "👶 Canales Infantiles (GitHub)": "https://raw.githubusercontent.com/santyagobm4-cmyk/mi-tv/main/kids.m3u",
    "🇨🇴 Mi Lista Colombia (GitHub)": "https://raw.githubusercontent.com/santyagobm4-cmyk/ps3/main/col.m3u",
    
    // LISTAS ESTABLES (IPTV-ORG)
    "🇲🇽 México": "https://iptv-org.github.io/iptv/countries/mx.m3u",
    "🇨🇴 Colombia (Estable)": "https://iptv-org.github.io/iptv/countries/co.m3u",
    "🇨🇱 Chile": "https://iptv-org.github.io/iptv/countries/cl.m3u",
    "🇦🇷 Argentina": "https://iptv-org.github.io/iptv/countries/ar.m3u",
    "🇪🇨 Ecuador": "https://iptv-org.github.io/iptv/countries/ec.m3u",
    "🇵🇪 Perú": "https://iptv-org.github.io/iptv/countries/pe.m3u",
    "🇻🇪 Venezuela": "https://iptv-org.github.io/iptv/countries/ve.m3u",
};


// ===================================
// VARIABLES GLOBALES Y UTILIDADES
// ===================================
let canalesGlobales = []; 
let listaActualVisible = false; 


/**
 * 🧹 Limpia el nombre del canal para eliminar etiquetas como [720p] o (HD).
 */
function cleanChannelName(name) {
    let cleanedName = name.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    cleanedName = cleanedName.replace(/\s+(HD|SD|FHD|UHD|4K|1080p|720p|540p|360p|h.264|H264|HEVC)$/i, '').trim();
    return cleanedName.trim();
}

/**
 * 🖼️ Genera la URL del logo.
 */
function getLogoUrl(channelName) {
    const baseName = channelName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .trim();
    return `https://i.mjh.nz/i/logos/${baseName}.png`;
}


// ===================================
// FUNCIONES DE CARGA Y PARSEO
// ===================================

function init() {
    const menuPaises = document.getElementById('menu-paises');
    
    document.getElementById('canales-lista').style.display = 'grid'; 
    document.getElementById('searchInput').style.display = 'none';

    for (const [nombre, url] of Object.entries(paises)) {
        const button = document.createElement('button');
        button.textContent = nombre;
        button.className = 'nav-button'; 
        button.onclick = () => cargarLista(url, button);
        menuPaises.appendChild(button);
    }
}

async function cargarLista(url, clickedButton) {
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');

    const contenedorCanales = document.getElementById('canales-lista');
    
    contenedorCanales.innerHTML = 'Cargando canales...';
    contenedorCanales.style.display = 'grid'; 
    document.getElementById('searchInput').style.display = 'none';
    listaActualVisible = false;
    
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Error HTTP: ${resp.status}`);
        }
        const text = await resp.text();
        const canales = parseM3U(text);
        
        mostrarCanales(canales); 

    } catch (error) {
        console.error('Error al cargar la lista:', error);
        contenedorCanales.innerHTML = `❌ Error al cargar canales: ${error.message}. Verifica la URL.`;
    }
}

function parseM3U(data) {
    const lineas = data.split('\n');
    const canales = [];
    let nombreCanal = '';

    for (const linea of lineas) {
        if (linea.startsWith('#EXTINF:')) {
            nombreCanal = linea.substring(linea.lastIndexOf(',') + 1).trim();
            nombreCanal = cleanChannelName(nombreCanal); 
        } else if (linea.startsWith('http')) {
            const url = linea.trim();
            if (nombreCanal) {
                canales.push({ nombre: nombreCanal, url: url });
                nombreCanal = ''; 
            }
        }
    }
    return canales;
}


// ===================================
// FUNCIÓN DE RENDERIZADO Y BÚSQUEDA
// ===================================

function mostrarCanales(canales) {
    canalesGlobales = canales; 
    
    document.getElementById('canales-lista').style.display = 'grid';
    document.getElementById('searchInput').style.display = 'block';
    listaActualVisible = true;

    renderizarCanales(canales); 
}

function renderizarCanales(canalesAMostrar) {
    const contenedorCanales = document.getElementById('canales-lista');
    contenedorCanales.innerHTML = ''; 

    if (canalesAMostrar.length === 0) {
        contenedorCanales.innerHTML = '<p>No se encontraron canales.</p>';
        return;
    }

    canalesAMostrar.forEach(canal => {
        const logoUrl = getLogoUrl(canal.nombre);
        
        const button = document.createElement('button');
        button.className = 'canal-tile'; 
        button.onclick = () => reproducirCanal(canal.url);
        
        button.innerHTML = `
            <img src="${logoUrl}" alt="${canal.nombre} Logo" class="canal-logo" onerror="this.src='https://i.mjh.nz/i/placeholder.png'">
            <span class="canal-nombre">${canal.nombre}</span>
        `;
        
        contenedorCanales.appendChild(button);
    });
}

/**
 * 🚀 FUNCIÓN DE REPRODUCCIÓN - MÉTODO COMPATIBLE CON MOVIAN/PS3.
 * Esto hará que el canal se reproduzca en el reproductor de video nativo de Movian.
 */
function reproducirCanal(url) {
    window.location.href = url;
}

/**
 * Filtra los canales en tiempo real.
 */
function filtrarCanales() {
    const textoBusqueda = document.getElementById('searchInput').value.toLowerCase();
    
    if (canalesGlobales.length === 0) return; 

    const canalesFiltrados = canalesGlobales.filter(canal => {
        return canal.nombre.toLowerCase().includes(textoBusqueda);
    });

    renderizarCanales(canalesFiltrados);
}

// Inicializa el menú
init();
