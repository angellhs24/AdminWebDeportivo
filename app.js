// Tus llaves de Supabase
const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'Sb_publishable_tOUsH1k4tx_1vCxSt_2Fzw_krnbCJTR';

// Inicializar la conexión
const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// Escuchar cuando se le dé clic al botón "Guardar"
document.getElementById('form-partido').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se refresque

    // Capturar los datos del formulario
    const datos = {
        local: document.getElementById('local').value,
        visita: document.getElementById('visita').value,
        cancha: document.getElementById('cancha').value,
        hora: document.getElementById('hora').value,
        dia: document.getElementById('dia').value,
        tipo: 'CAMP', // Valores por defecto
        cat: 'Varonil'
    };

    // MANDAR A LA NUBE
    const { error } = await _supabase.from('partidos').insert([datos]);

    if (error) {
        alert("Hubo un error: " + error.message);
    } else {
        alert("¡ÉXITO! Partido guardado en la nube.");
        document.getElementById('form-partido').reset();
    }
});
