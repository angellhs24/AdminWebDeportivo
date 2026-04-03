// --- CONFIGURACIÓN ---
const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Pon tu llave completa aquí
const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// --- 1. EL GUARDIA ---
if (sessionStorage.getItem('sesion_activa') !== 'true') {
    window.location.href = 'login.html';
}

function cerrarSesion() {
    sessionStorage.removeItem('sesion_activa');
    window.location.href = 'login.html';
}

// --- 2. NAVEGACIÓN ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.currentTarget.classList.add('active');

    // Cargar datos automáticamente al abrir sección
    if(sectionId === 'partidos') cargarPartidos();
    if(sectionId === 'sanciones') cargarSanciones();
}

// --- 3. LÓGICA DE PARTIDOS ---

// Guardar
document.getElementById('btn-guardar-partido').addEventListener('click', async () => {
    const datos = {
        Local: document.getElementById('local').value,
        Visita: document.getElementById('visita').value,
        Cancha: document.getElementById('cancha').value,
        Hora: document.getElementById('hora').value,
        Dia: document.getElementById('dia').value,
        Tipo: 'CAMP', Cat: 'Varonil'
    };

    const { error } = await _supabase.from('Partidos').insert([datos]);
    if (error) alert("Error: " + error.message);
    else { alert("Guardado!"); cargarPartidos(); }
});

// Leer y mostrar con botón de borrar
async function cargarPartidos() {
    const lista = document.getElementById('lista-partidos');
    lista.innerHTML = "Cargando...";
    
    const { data, error } = await _supabase.from('Partidos').select('*').order('id', { ascending: false });
    
    lista.innerHTML = "";
    data.forEach(p => {
        lista.innerHTML += `
            <div class="item-lista">
                <span><b>${p.Local} vs ${p.Visita}</b> - ${p.Dia} (${p.Hora})</span>
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
    if(confirm("⚠ ESTO BORRARÁ TODOS LOS PARTIDOS. ¿Continuar?")) {
        await _supabase.from('Partidos').delete().neq('id', 0);
        cargarPartidos();
    }
}

// --- NOTA ---
// Deberás repetir la lógica de cargarPartidos para Sanciones y Anuncios 
// creando las tablas 'sanciones' y 'anuncios' en Supabase.
