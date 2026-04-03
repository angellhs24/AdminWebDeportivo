const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// --- INICIO Y SEGURIDAD ---
window.onload = () => {
    if (sessionStorage.getItem('sesion_activa') !== 'true') {
        window.location.href = 'login.html';
    } else {
        verificarUrgentes(); // Ver alerta al entrar
        cargarAnuncios();
    }
};

function cerrarSesion() { sessionStorage.removeItem('sesion_activa'); window.location.href = 'login.html'; }

// --- MODAL URGENTE ---
async function verificarUrgentes() {
    const { data } = await _supabase
        .from('anuncios')
        .select('*')
        .eq('Tipo', 'urgente')
        .order('created_at', { ascending: false })
        .limit(1);

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
    event.currentTarget.classList.add('active');

    if(sectionId === 'partidos') cargarPartidosOrganizados();
    if(sectionId === 'sanciones') cargarSanciones();
    if(sectionId === 'anuncios') cargarAnuncios();
}

// --- COMUNICADOS ---
async function guardarAviso() {
    const datos = {
        Titulo: document.getElementById('titulo-aviso').value,
        Contenido: document.getElementById('contenido-aviso').value,
        Tipo: document.getElementById('tipo-aviso').value
    };
    const { error } = await _supabase.from('anuncios').insert([datos]);
    if(!error) { alert("Publicado!"); cargarAnuncios(); }
}

async function cargarAnuncios() {
    const { data } = await _supabase.from('anuncios').select('*').order('created_at', { ascending: false });
    const div = document.getElementById('lista-anuncios');
    div.innerHTML = "";
    data?.forEach(a => {
        const estiloUrgente = a.Tipo === 'urgente' ? 'urgent-style' : '';
        const badge = a.Tipo === 'urgente' ? '<span class="badge bg-urgente">URGENTE</span>' : '<span class="badge bg-normal">NOTICIA</span>';
        
        div.innerHTML += `
        <div class="item ${estiloUrgente}">
            <div>${badge} <b>${a.Titulo}</b><br><small>${a.Contenido}</small></div>
            <button class="btn-delete" onclick="borrarAnuncio(${a.id})">BORRAR</button>
        </div>`;
    });
}

async function borrarAnuncio(id) {
    await _supabase.from('anuncios').delete().eq('id', id);
    cargarAnuncios();
}

// --- ROL DE JUEGO (LÓGICA MEJORADA) ---
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
    if(!error) cargarPartidosOrganizados();
});

async function cargarPartidosOrganizados() {
    const contenedor = document.getElementById('jornada-organizada');
    const { data } = await _supabase.from('Partidos').select('*').order('Hora', { ascending: true });
    if (!data) return;
    contenedor.innerHTML = "";
    ["Sábado", "Domingo"].forEach(dia => {
        const pDia = data.filter(p => p.Dia === dia);
        if (pDia.length > 0) {
            contenedor.innerHTML += `<span class="label-dia">${dia.toUpperCase()}</span>`;
            ["Central", "1", "2", "3", "4", "5", "6", "7"].forEach(c => {
                const pC = pDia.filter(p => p.Cancha === c);
                if (pC.length > 0) {
                    contenedor.innerHTML += `<div style="color:#777; font-size:0.8rem; margin:10px 0 5px 0">CANCHA ${c}</div>`;
                    pC.forEach(p => {
                        contenedor.innerHTML += `
                        <div class="item">
                            <span><b>${p.Hora}</b> | ${p.Local} vs ${p.Visita}</span>
                            <button class="btn-delete" onclick="borrarPartido(${p.id})">ELIMINAR</button>
                        </div>`;
                    });
                }
            });
        }
    });
}

async function borrarPartido(id) { await _supabase.from('Partidos').delete().eq('id', id); cargarPartidosOrganizados(); }

// --- SANCIONES ---
async function guardarSancion() {
    const datos = {
        jugador: document.getElementById('jugador-san').value,
        equipo: document.getElementById('equipo-san').value,
        representante: document.getElementById('rep-san').value,
        estado: document.getElementById('estado-san').value,
        categoria: document.getElementById('cat-san').value,
        sancion: document.getElementById('motivo-san').value
    };
    await _supabase.from('sanciones').insert([datos]);
    cargarSanciones();
}

async function cargarSanciones() {
    const { data } = await _supabase.from('sanciones').select('*').order('id', { ascending: false });
    const div = document.getElementById('lista-sanciones');
    div.innerHTML = "";
    data?.forEach(s => {
        div.innerHTML += `
        <div class="item">
            <div><span class="badge bg-normal">${s.estado}</span> <b>${s.jugador}</b> (${s.equipo})<br><small>Castigo: ${s.sancion}</small></div>
            <button class="btn-delete" onclick="borrarSancion(${s.id})">BORRAR</button>
        </div>`;
    });
}

async function borrarSancion(id) { await _supabase.from('sanciones').delete().eq('id', id); cargarSanciones(); }
