const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// --- SEGURIDAD AL CARGAR ---
window.onload = () => {
    if (sessionStorage.getItem('sesion_activa') !== 'true') {
        window.location.href = 'login.html';
    } else {
        verificarUrgentes(); // Ver alerta pop-up al entrar
        cargarAnuncios();
    }
};

function cerrarSesion() { sessionStorage.removeItem('sesion_activa'); window.location.href = 'login.html'; }

// --- FUNCIÓN DEL MODAL URGENTE ---
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
}

// --- GESTIÓN DE ROL DE JUEGOS (2 COLUMNAS + ANIMACIÓN) ---
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
    
    if(!error) {
        btn.innerText = "¡PUBLICADO!";
        setTimeout(() => btn.innerText = "SUBIR AL CALENDARIO OFICIAL", 2000);
        cargarPartidosOrganizados();
    }
});

async function cargarPartidosOrganizados() {
    const colSabado = document.getElementById('lista-sabado');
    const colDomingo = document.getElementById('lista-domingo');
    
    colSabado.innerHTML = "<p style='color:#444'>Cargando...</p>";
    colDomingo.innerHTML = "<p style='color:#444'>Cargando...</p>";

    const { data, error } = await _supabase.from('Partidos').select('*').order('Hora', { ascending: true });

    if (error || !data) return;

    colSabado.innerHTML = "";
    colDomingo.innerHTML = "";

    data.forEach((p, index) => {
        const cardHTML = `
            <div class="match-card" style="animation-delay: ${index * 0.1}s">
                <div class="teams">
                    <span>${p.Local} <span class="vs">VS</span> ${p.Visita}</span>
                    <button class="btn-delete" onclick="borrarPartido(${p.id})">×</button>
                </div>
                <div class="details">
                    <span style="color:var(--espn-red)">${p.Hora}</span>
                    <span class="cancha-badge">Cancha ${p.Cancha}</span>
                </div>
            </div>
        `;

        if (p.Dia === "Sábado") colSabado.innerHTML += cardHTML;
        else if (p.Dia === "Domingo") colDomingo.innerHTML += cardHTML;
    });

    if(colSabado.innerHTML === "") colSabado.innerHTML = "<p style='color:#333'>No hay juegos</p>";
    if(colDomingo.innerHTML === "") colDomingo.innerHTML = "<p style='color:#333'>No hay juegos</p>";
}

async function borrarPartido(id) {
    if(confirm("¿Eliminar este encuentro?")) {
        await _supabase.from('Partidos').delete().eq('id', id);
        cargarPartidosOrganizados();
    }
}

// --- COMUNICADOS ---
async function guardarAviso() {
    const { error } = await _supabase.from('anuncios').insert([{ 
        Titulo: document.getElementById('titulo-aviso').value, 
        Contenido: document.getElementById('contenido-aviso').value,
        Tipo: document.getElementById('tipo-aviso').value
    }]);
    if(!error) { alert("Publicado con éxito"); cargarAnuncios(); }
}

async function cargarAnuncios() {
    const { data } = await _supabase.from('anuncios').select('*').order('created_at', { ascending: false });
    const div = document.getElementById('lista-anuncios');
    div.innerHTML = "";
    data?.forEach(a => {
        const border = a.Tipo === 'urgente' ? 'border-left: 5px solid var(--urgent)' : 'border-left: 5px solid #444';
        div.innerHTML += `
        <div class="match-card" style="opacity:1; animation:none; ${border}">
            <div class="teams">
                <span><b>${a.Titulo}</b></span>
                <button class="btn-delete" onclick="borrarAnuncio(${a.id})">QUITAR</button>
            </div>
            <div class="details">${a.Contenido}</div>
        </div>`;
    });
}

async function borrarAnuncio(id) {
    await _supabase.from('anuncios').delete().eq('id', id);
    cargarAnuncios();
}

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
        <div class="match-card" style="opacity:1; animation:none;">
            <div class="teams">
                <span><b>${s.jugador}</b> <small style="font-size:0.6rem; color:#666">${s.categoria}</small></span>
                <button class="btn-delete" onclick="borrarSancion(${s.id})">×</button>
            </div>
            <div class="details">
                ${s.equipo} | Sanción: <b style="color:white">${s.sancion}</b>
            </div>
        </div>`;
    });
}

async function borrarSancion(id) { await _supabase.from('sanciones').delete().eq('id', id); cargarSanciones(); }
