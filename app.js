// 1. CONFIGURACIÓN (Tus llaves reales)
const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// 2. EL GUARDIA (Seguridad)
// Si no hay sesión activa, redirige al login
if (sessionStorage.getItem('sesion_activa') !== 'true') {
    window.location.href = 'login.html';
}

function cerrarSesion() {
    sessionStorage.removeItem('sesion_activa');
    window.location.href = 'login.html';
}

// 3. NAVEGACIÓN ENTRE SECCIONES
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    // Marcamos el botón actual como activo
    event.currentTarget.classList.add('active');

    // Cargar datos automáticamente al entrar a la sección
    if(sectionId === 'partidos') cargarPartidos();
    if(sectionId === 'sanciones') cargarSanciones();
    if(sectionId === 'anuncios') cargarAnuncios();
}

// ==========================================
// 4. SECCIÓN PARTIDOS
// ==========================================

// Guardar Partido
document.getElementById('btn-guardar-partido').addEventListener('click', async () => {
    const datos = {
        Local: document.getElementById('local').value,
        Visita: document.getElementById('visita').value,
        Cancha: document.getElementById('cancha').value,
        Hora: document.getElementById('hora').value,
        Dia: document.getElementById('dia').value,
        Tipo: 'CAMP', 
        Cat: 'Varonil'
    };

    const { error } = await _supabase.from('Partidos').insert([datos]);
    if (error) alert("Error: " + error.message);
    else { 
        alert("¡Partido guardado!"); 
        cargarPartidos();
        // Limpiar campos
        document.getElementById('local').value = "";
        document.getElementById('visita').value = "";
    }
});

// Cargar Lista de Partidos
async function cargarPartidos() {
    const lista = document.getElementById('lista-partidos');
    lista.innerHTML = "<p>Cargando jornada...</p>";
    
    const { data, error } = await _supabase.from('Partidos').select('*').order('id', { ascending: false });
    
    if (error) return;
    lista.innerHTML = "";
    data.forEach(p => {
        lista.innerHTML += `
            <div class="item-lista">
                <span><b>${p.Local} vs ${p.Visita}</b> | ${p.Dia} (${p.Hora})</span>
                <button class="btn-danger" onclick="borrarPartido(${p.id})">Eliminar</button>
            </div>
        `;
    });
}

async function borrarPartido(id) {
    if(confirm("¿Borrar este partido?")) {
        await _supabase.from('Partidos').delete().eq('id', id);
        cargarPartidos();
    }
}

async function limpiarJornada() {
    if(confirm("⚠ ¿BORRAR TODA LA JORNADA?")) {
        await _supabase.from('Partidos').delete().neq('id', 0);
        cargarPartidos();
    }
}

// ==========================================
// 5. SECCIÓN ANUNCIOS
// ==========================================

async function guardarAviso() {
    const titulo = document.getElementById('titulo-aviso').value;
    const contenido = document.getElementById('contenido-aviso').value;

    const { error } = await _supabase.from('anuncios').insert([{ Titulo: titulo, Contenido: contenido }]);
    if (error) alert("Error: " + error.message);
    else { 
        alert("Anuncio publicado");
        cargarAnuncios();
    }
}

async function cargarAnuncios() {
    const div = document.getElementById('lista-anuncios');
    const { data } = await _supabase.from('anuncios').select('*').order('id', { ascending: false });
    div.innerHTML = "";
    data?.forEach(a => {
        div.innerHTML += `
            <div class="item-lista">
                <span><b>${a.Titulo}</b></span>
                <button class="btn-danger" onclick="borrarAnuncio(${a.id})">Quitar</button>
            </div>`;
    });
}

async function borrarAnuncio(id) {
    await _supabase.from('anuncios').delete().eq('id', id);
    cargarAnuncios();
}

// ==========================================
// 6. SECCIÓN SANCIONES
// ==========================================

async function guardarSancion() {
    const datos = {
        Jugador: document.getElementById('jugador-san').value,
        Equipo: document.getElementById('equipo-san').value,
        Motivo: document.getElementById('motivo-san').value
    };

    const { error } = await _supabase.from('sanciones').insert([datos]);
    if (error) alert("Error: " + error.message);
    else { 
        alert("Sanción registrada");
        cargarSanciones();
    }
}

async function cargarSanciones() {
    const div = document.getElementById('lista-sanciones');
    const { data } = await _supabase.from('sanciones').select('*').order('id', { ascending: false });
    div.innerHTML = "";
    data?.forEach(s => {
        div.innerHTML += `
            <div class="item-lista">
                <span><b>${s.Jugador}</b> (${s.Equipo}) - ${s.Motivo}</span>
                <button class="btn-danger" onclick="borrarSancion(${s.id})">Borrar</button>
            </div>`;
    });
}

async function borrarSancion(id) {
    await _supabase.from('sanciones').delete().eq('id', id);
    cargarSanciones();
}

