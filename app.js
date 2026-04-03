// Configuración de conexión (Tus llaves reales)
const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

// Inicializar Supabase
const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// Función para guardar
document.getElementById('form-partido').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
        local: document.getElementById('local').value,
        visita: document.getElementById('visita').value,
        cancha: document.getElementById('cancha').value,
        hora: document.getElementById('hora').value,
        dia: document.getElementById('dia').value,
        tipo: 'CAMP', 
        cat: 'Varonil'
    };

    console.log("Intentando guardar:", datos);

    const { error } = await _supabase.from('partidos').insert([datos]);

    if (error) {
        alert("Error de Supabase: " + error.message);
    } else {
        alert("¡ÉXITO! El partido se guardó en la nube de Ohio.");
        document.getElementById('form-partido').reset();
    }
});
