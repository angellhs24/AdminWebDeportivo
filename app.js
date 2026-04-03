const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

window.onload = () => {
    if (sessionStorage.getItem('sesion_activa') !== 'true') {
        window.location.href = 'login.html';
    } else {
        verificarUrgentes();
        cargarAnuncios(); // Carga inicial
    }
};

function cerrarSesion() { sessionStorage.removeItem('sesion_activa'); window.location.href = 'login.html'; }

// --- MODAL ---
async function verificarUrgentes() {
    const { data } = await _supabase.from('anuncios').select('*').eq('Tipo', 'urgente').order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
        document.getElementById('modal-titulo').innerText = data[0].Titulo;
        document.getElementById('modal-texto').innerText = data[0].Contenido;
        document.getElementById('modal-urgente').style.display = 'flex';
    }
}
function cerrarModal() { document.getElementById('modal-urgente').style.display = 'none'; }

// --- NAVEGACIÓN (Actualiza datos al cambiar) ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    event.currentTarget.classList.add('active');

    if(sectionId === 'partidos') cargarPartidosOrganizados();
    if(sectionId === 'sanciones') cargarSanciones();
    if(sectionId === 'anuncios') cargarAnuncios();
}

// --- PARTIDOS ---
document.getElementById('btn-guardar-partido').addEventListener('click', async () => {
    const datos = {
        Local: document.getElementById('local').value,
        Visita: document.getElementById('visita').value,
        Cancha: document.getElementById('cancha').value,
        Hora: document.getElementById('hora').value,
        Dia: document.getElementById('dia').value,
        Tipo: 'CAMP'
    };
    await _supabase.from('Partidos').insert([datos]);
    cargarPartidosOrganizados();
});

async function cargarPartidosOrganizados() {
    const { data } = await _supabase.from('Partidos').select('*').order('Hora', { ascending: true });
    const colSab = document.getElementById('lista-sabado');
    const colDom = document.getElementById('lista-domingo');
    colSab.innerHTML = ""; colDom.innerHTML = "";

    data?.forEach((p, i) => {
        const html = `
            <div class="match-card" style="animation-delay:${i*0.05}s">
                <div class="teams">${p.Local} <span class="vs">VS</span> ${p.Visita} <button class="btn-delete" onclick="borrarPartido(${p.id})">×</button></div>
                <div class="details"><span>${p.Hora}</span><span class="cancha-badge">Cancha ${p.Cancha}</span></div>
            </div>`;
        if(p.Dia === "Sábado") colSab.innerHTML += html; else colDom.innerHTML += html;
    });
}

async function borrarPartido(id) { await _supabase.from('Partidos').delete().eq('id', id); cargarPartidosOrganizados(); }

async function limpiarJornadaCompleta() {
    if(confirm("¿Estás seguro de borrar TODOS los partidos de la base de datos?")) {
        await _supabase.from('Partidos').delete().neq('id', 0);
        cargarPartidosOrganizados();
    }
}

// --- ANUNCIOS ---
async function guardarAviso() {
    await _supabase.from('anuncios').insert([{ Titulo: document.getElementById('titulo-aviso').value, Contenido: document.getElementById('contenido-aviso').value, Tipo: document.getElementById('tipo-aviso').value }]);
    cargarAnuncios();
}

async function cargarAnuncios() {
    const { data } = await _supabase.from('anuncios').select('*').order('created_at', { ascending: false });
    const div = document.getElementById('lista-anuncios');
    div.innerHTML = "";
    data?.forEach(a => {
        div.innerHTML += `<div class="match-card" style="opacity:1; animation:none; border-left-color:${a.Tipo==='urgente'?'yellow':'#444'}">
            <div class="teams"><span>${a.Titulo}</span><button class="btn-delete" onclick="borrarAnuncio(${a.id})">×</button></div>
            <div class="details">${a.Contenido}</div>
        </div>`;
    });
}

async function borrarAnuncio(id) { await _supabase.from('anuncios').delete().eq('id', id); cargarAnuncios(); }

// --- SANCIONES ---
async function guardarSancion() {
    await _supabase.from('sanciones').insert([{ jugador: document.getElementById('jugador-san').value, equipo: document.getElementById('equipo-san').value, estado: document.getElementById('estado-san').value, sancion: document.getElementById('motivo-san').value }]);
    cargarSanciones();
}

async function cargarSanciones() {
    const { data } = await _supabase.from('sanciones').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-sanciones');
    div.innerHTML = "";
    data?.forEach(s => {
        div.innerHTML += `<div class="match-card" style="opacity:1; animation:none">
            <div class="teams"><span>${s.jugador} (${s.equipo})</span><button class="btn-delete" onclick="borrarSancion(${s.id})">×</button></div>
            <div class="details">Estado: ${s.estado} | Castigo: ${s.sancion}</div>
        </div>`;
    });
}

async function borrarSancion(id) { await _supabase.from('sanciones').delete().eq('id', id); cargarSanciones(); }
