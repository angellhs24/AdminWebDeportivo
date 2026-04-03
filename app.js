const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// GUARDIA
if (sessionStorage.getItem('sesion_activa') !== 'true') { window.location.href = 'login.html'; }
function cerrarSesion() { sessionStorage.removeItem('sesion_activa'); window.location.href = 'login.html'; }

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

// ==========================================
// SECCIÓN PARTIDOS (ARREGLADO)
// ==========================================
document.getElementById('btn-guardar-partido').addEventListener('click', async () => {
    const datos = {
        Local: document.getElementById('local').value,
        Visita: document.getElementById('visita').value,
        Cancha: document.getElementById('cancha').value,
        Hora: document.getElementById('hora').value,
        Dia: document.getElementById('dia').value,
        Tipo: 'CAMP'
    };

    const { error } = await _supabase.from('Partidos').insert([datos]);
    if (error) alert("Error: " + error.message);
    else { cargarPartidosOrganizados(); }
});

async function cargarPartidosOrganizados() {
    const contenedor = document.getElementById('jornada-organizada');
    contenedor.innerHTML = "<p>Actualizando lista...</p>";

    const { data, error } = await _supabase.from('Partidos').select('*').order('Hora', { ascending: true });

    if (error || !data) return;
    contenedor.innerHTML = "";

    const dias = ["Sábado", "Domingo"];
    const canchas = ["Central", "1", "2", "3", "4", "5", "6", "7"];

    dias.forEach(dia => {
        const pDia = data.filter(p => p.Dia === dia);
        if (pDia.length > 0) {
            contenedor.innerHTML += `<div class="day-label">${dia}</div>`;
            canchas.forEach(c => {
                const pCancha = pDia.filter(p => p.Cancha === c);
                if (pCancha.length > 0) {
                    contenedor.innerHTML += `<div class="cancha-label">CANCHA ${c}</div>`;
                    pCancha.forEach(p => {
                        contenedor.innerHTML += `
                        <div class="data-item">
                            <div><b>${p.Hora}</b> | ${p.Local} vs ${p.Visita}</div>
                            <button class="btn-delete" onclick="borrarPartido(${p.id})">ELIMINAR</button>
                        </div>`;
                    });
                }
            });
        }
    });
}

async function borrarPartido(id) {
    if(confirm("¿Borrar partido?")) { await _supabase.from('Partidos').delete().eq('id', id); cargarPartidosOrganizados(); }
}

async function limpiarJornada() {
    if(confirm("⚠ BORRAR TODO?")) { await _supabase.from('Partidos').delete().neq('id', 0); cargarPartidosOrganizados(); }
}

// ==========================================
// SECCIÓN ANUNCIOS
// ==========================================
async function guardarAviso() {
    const { error } = await _supabase.from('anuncios').insert([{ 
        Titulo: document.getElementById('titulo-aviso').value, 
        Contenido: document.getElementById('contenido-aviso').value 
    }]);
    if(!error) { document.getElementById('titulo-aviso').value=""; document.getElementById('contenido-aviso').value=""; cargarAnuncios(); }
}

async function cargarAnuncios() {
    const { data } = await _supabase.from('anuncios').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-anuncios');
    div.innerHTML = "";
    data?.forEach(a => {
        div.innerHTML += `<div class="data-item">
            <div><b>${a.Titulo}</b><br><small>${a.Contenido}</small></div>
            <button class="btn-delete" onclick="borrarAnuncio(${a.id})">QUITAR</button>
        </div>`;
    });
}

async function borrarAnuncio(id) {
    await _supabase.from('anuncios').delete().eq('id', id); cargarAnuncios();
}

// ==========================================
// SECCIÓN SANCIONES (NUEVA ESTRUCTURA)
// ==========================================
async function guardarSancion() {
    const datos = {
        jugador: document.getElementById('jugador-san').value,
        equipo: document.getElementById('equipo-san').value,
        representante: document.getElementById('rep-san').value,
        estado: document.getElementById('estado-san').value,
        categoria: document.getElementById('cat-san').value,
        sancion: document.getElementById('motivo-san').value
    };

    const { error } = await _supabase.from('sanciones').insert([datos]);
    if (error) alert(error.message);
    else { cargarSanciones(); }
}

async function cargarSanciones() {
    const { data } = await _supabase.from('sanciones').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-sanciones');
    div.innerHTML = "";
    data?.forEach(s => {
        div.innerHTML += `
        <div class="data-item">
            <div>
                <span class="badge status-${s.estado}">${s.estado}</span>
                <b style="margin-left:10px">${s.jugador}</b> [${s.categoria}]<br>
                <small>${s.equipo} | Rep: ${s.representante} | <b>Castigo: ${s.sancion}</b></small>
            </div>
            <button class="btn-delete" onclick="borrarSancion(${s.id})">ELIMINAR</button>
        </div>`;
    });
}

async function borrarSancion(id) {
    await _supabase.from('sanciones').delete().eq('id', id); cargarSanciones();
}
