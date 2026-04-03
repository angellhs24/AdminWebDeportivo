const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// GUARDIA DE SEGURIDAD
if (sessionStorage.getItem('sesion_activa') !== 'true') {
    window.location.href = 'login.html';
}

function cerrarSesion() {
    sessionStorage.removeItem('sesion_activa');
    window.location.href = 'login.html';
}

// NAVEGACIÓN
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    event.currentTarget.classList.add('active');

    if(sectionId === 'partidos') cargarPartidosOrganizados();
    if(sectionId === 'sanciones') cargarSanciones();
    if(sectionId === 'anuncios') cargarAnuncios();
}

// --- GESTIÓN DE PARTIDOS ---
document.getElementById('btn-guardar-partido').addEventListener('click', async () => {
    const btn = document.getElementById('btn-guardar-partido');
    btn.innerText = "PROCESANDO...";

    const datos = {
        Local: document.getElementById('local').value,
        Visita: document.getElementById('visita').value,
        Cancha: document.getElementById('cancha').value,
        Hora: document.getElementById('hora').value,
        Dia: document.getElementById('dia').value,
        Tipo: 'CAMP'
    };

    const { error } = await _supabase.from('Partidos').insert([datos]);
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        btn.innerText = "¡GUARDADO!";
        setTimeout(() => btn.innerText = "GUARDAR EN CALENDARIO", 2000);
        cargarPartidosOrganizados();
    }
});

async function cargarPartidosOrganizados() {
    const contenedor = document.getElementById('jornada-organizada');
    contenedor.innerHTML = "Consultando base de datos...";

    const { data, error } = await _supabase.from('Partidos').select('*').order('Hora', { ascending: true });

    if (error) return;

    contenedor.innerHTML = "";
    const dias = ["Sábado", "Domingo"];
    const canchas = ["Central", "1", "2", "3", "4", "5", "6", "7"];

    dias.forEach(dia => {
        const partidosDelDia = data.filter(p => p.Dia === dia);
        if (partidosDelDia.length > 0) {
            contenedor.innerHTML += `<div class="dia-header">${dia.toUpperCase()}</div>`;
            
            canchas.forEach(cancha => {
                const partidosCancha = partidosDelDia.filter(p => p.Cancha === cancha);
                if (partidosCancha.length > 0) {
                    contenedor.innerHTML += `<div class="cancha-group"><div class="cancha-title">Cancha ${cancha}</div>`;
                    partidosCancha.forEach(p => {
                        contenedor.innerHTML += `
                            <div class="match-row">
                                <span><b>${p.Hora}</b> | ${p.Local} vs ${p.Visita}</span>
                                <button class="btn-delete" onclick="borrarPartido(${p.id})">X</button>
                            </div>
                        `;
                    });
                    contenedor.innerHTML += `</div>`;
                }
            });
        }
    });
}

async function borrarPartido(id) {
    if(confirm("¿Eliminar este partido del rol?")) {
        await _supabase.from('Partidos').delete().eq('id', id);
        cargarPartidosOrganizados();
    }
}

async function limpiarJornada() {
    if(confirm("⚠ ESTO BORRARÁ TODOS LOS PARTIDOS DE LA SEMANA. ¿Continuar?")) {
        await _supabase.from('Partidos').delete().neq('id', 0);
        cargarPartidosOrganizados();
    }
}

// --- ANUNCIOS Y SANCIONES (Lógica similar) ---
async function guardarAviso() {
    const { error } = await _supabase.from('anuncios').insert([{ 
        Titulo: document.getElementById('titulo-aviso').value, 
        Contenido: document.getElementById('contenido-aviso').value 
    }]);
    if(!error) cargarAnuncios();
}

async function cargarAnuncios() {
    const { data } = await _supabase.from('anuncios').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-anuncios');
    div.innerHTML = "";
    data?.forEach(a => {
        div.innerHTML += `<div class="match-row"><span>${a.Titulo}</span><button class="btn-delete" onclick="borrarAnuncio(${a.id})">Eliminar</button></div>`;
    });
}

async function borrarAnuncio(id) {
    await _supabase.from('anuncios').delete().eq('id', id);
    cargarAnuncios();
}

// Lógica de Sanciones
async function guardarSancion() {
    const { error } = await _supabase.from('sanciones').insert([{ 
        Jugador: document.getElementById('jugador-san').value, 
        Equipo: document.getElementById('equipo-san').value,
        Motivo: document.getElementById('motivo-san').value
    }]);
    if(!error) cargarSanciones();
}

async function cargarSanciones() {
    const { data } = await _supabase.from('sanciones').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-sanciones');
    div.innerHTML = "";
    data?.forEach(s => {
        div.innerHTML += `<div class="match-row"><span><b>${s.Jugador}</b> (${s.Equipo}) - ${s.Motivo}</span><button class="btn-delete" onclick="borrarSancion(${s.id})">X</button></div>`;
    });
}

async function borrarSancion(id) {
    await _supabase.from('sanciones').delete().eq('id', id);
    cargarSanciones();
}
