const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

window.onload = () => {
    if (sessionStorage.getItem('sesion_activa') !== 'true') {
        window.location.href = 'login.html';
    } else {
        verificarUrgentes();
        cargarAnuncios();
    }
};

function cerrarSesion() { sessionStorage.removeItem('sesion_activa'); window.location.href = 'login.html'; }

// --- MODAL URGENTE ---
async function verificarUrgentes() {
    const { data } = await _supabase.from('anuncios').select('*').eq('Tipo', 'urgente').order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
        document.getElementById('modal-titulo').innerText = data[0].Titulo;
        document.getElementById('modal-texto').innerText = data[0].Contenido;
        document.getElementById('modal-urgente').style.display = 'flex';
    }
}
function cerrarModal() { document.getElementById('modal-urgente').style.display = 'none'; }

// --- NAVEGACIÓN ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Ajuste para móviles al hacer click
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if(link.getAttribute('onclick').includes(sectionId)) link.classList.add('active');
    });

    if(sectionId === 'partidos') cargarPartidosOrganizados();
    if(sectionId === 'sanciones') cargarSanciones();
    if(sectionId === 'anuncios') cargarAnuncios();
}

// --- PARTIDOS ---
document.getElementById('btn-guardar-partido').addEventListener('click', async () => {
    const local = document.getElementById('local');
    const visita = document.getElementById('visita');
    const cancha = document.getElementById('cancha');
    const hora = document.getElementById('hora');
    const dia = document.getElementById('dia');

    const { error } = await _supabase.from('Partidos').insert([{
        Local: local.value,
        Visita: visita.value,
        Cancha: cancha.value,
        Hora: hora.value,
        Dia: dia.value
    }]);

    if(!error) {
        local.value = ""; visita.value = ""; hora.value = "";
        cargarPartidosOrganizados();
    }
});

async function cargarPartidosOrganizados() {
    const { data } = await _supabase.from('Partidos').select('*').order('Hora', { ascending: true });
    const colSab = document.getElementById('lista-sabado');
    const colDom = document.getElementById('lista-domingo');
    colSab.innerHTML = ""; colDom.innerHTML = "";

    data?.forEach((p, i) => {
        const html = `
            <div class="match-card" style="animation-delay:${i*0.05}s">
                <div class="teams"><span>${p.Local} <span class="vs">VS</span> ${p.Visita}</span> <button class="btn-delete" onclick="borrarPartido(${p.id})">×</button></div>
                <div class="details"><span>${p.Hora}</span><span class="cancha-badge">Cancha ${p.Cancha}</span></div>
            </div>`;
        if(p.Dia === "Sábado") colSab.innerHTML += html; else colDom.innerHTML += html;
    });
}

async function borrarPartido(id) { if(confirm("¿Eliminar?")) { await _supabase.from('Partidos').delete().eq('id', id); cargarPartidosOrganizados(); } }

async function limpiarJornadaCompleta() {
    if(confirm("¿BORRAR TODA LA JORNADA?")) {
        await _supabase.from('Partidos').delete().neq('id', 0);
        cargarPartidosOrganizados();
    }
}

// --- ANUNCIOS (Corregido Mayúsculas) ---
async function guardarAviso() {
    const titulo = document.getElementById('titulo-aviso');
    const contenido = document.getElementById('contenido-aviso');
    const tipo = document.getElementById('tipo-aviso');

    const { error } = await _supabase.from('anuncios').insert([{ 
        Titulo: titulo.value, 
        Contenido: contenido.value, 
        Tipo: tipo.value 
    }]);

    if(!error) {
        titulo.value = ""; contenido.value = "";
        cargarAnuncios();
    }
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

async function borrarAnuncio(id) { if(confirm("¿Eliminar aviso?")) { await _supabase.from('anuncios').delete().eq('id', id); cargarAnuncios(); } }

// --- SANCIONES ---
async function guardarSancion() {
    const jugador = document.getElementById('jugador-san');
    const equipo = document.getElementById('equipo-san');
    const rep = document.getElementById('rep-san');
    const cat = document.getElementById('cat-san');
    const estado = document.getElementById('estado-san');
    const motivo = document.getElementById('motivo-san');

    const { error } = await _supabase.from('sanciones').insert([{ 
        jugador: jugador.value, 
        equipo: equipo.value, 
        representante: rep.value,
        categoria: cat.value,
        estado: estado.value, 
        sancion: motivo.value 
    }]);

    if(!error) {
        jugador.value = ""; equipo.value = ""; rep.value = ""; motivo.value = "";
        cargarSanciones();
    }
}

async function cargarSanciones() {
    const { data } = await _supabase.from('sanciones').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-sanciones');
    div.innerHTML = "";
    data?.forEach(s => {
        div.innerHTML += `<div class="match-card" style="opacity:1; animation:none">
            <div class="teams"><span>${s.jugador}</span> <button class="btn-delete" onclick="borrarSancion(${s.id})">×</button></div>
            <div class="details">
                <span><b>EQ:</b> ${s.equipo}</span>
                <span><b>CAT:</b> ${s.categoria}</span>
                <span><b>SANCION:</b> ${s.sancion}</span>
            </div>
        </div>`;
    });
}

async function borrarSancion(id) { if(confirm("¿Quitar sanción?")) { await _supabase.from('sanciones').delete().eq('id', id); cargarSanciones(); } }
