// 1. CONFIGURACIÓN DE CONEXIÓN (Tus llaves reales)
const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

// 2. INICIALIZAR EL CLIENTE DE SUPABASE
const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

// 3. ESCUCHAR EL EVENTO DE ENVÍO DEL FORMULARIO
document.getElementById('form-partido').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // 4. CAPTURAR LOS DATOS (Asegúrate que los ID en el HTML coincidan)
    const datosParaEnviar = {
        Local: document.getElementById('local').value,
        Visita: document.getElementById('visita').value,
        Cancha: document.getElementById('cancha').value,
        Hora: document.getElementById('hora').value,
        Dia: document.getElementById('dia').value,
        Tipo: 'CAMP',       // Valor por defecto para Campeonato
        Cat: 'Varonil'      // Valor por defecto para Categoría
    };

    console.log("Enviando datos a Supabase...", datosParaEnviar);

    // 5. INSERTAR EN LA TABLA "Partidos" (Con P mayúscula)
    const { data, error } = await _supabase
        .from('Partidos') 
        .insert([datosParaEnviar]);

    // 6. RESPUESTA AL USUARIO
    if (error) {
        console.error("Error detallado:", error);
        alert("Error de Supabase: " + error.message);
    } else {
        alert("¡ÉXITO! El partido se guardó correctamente en la nube.");
        document.getElementById('form-partido').reset(); // Limpia el formulario
    }
});

// BORRAR UN PARTIDO POR ID
async function eliminarPartido(id) {
    const { error } = await _supabase
        .from('Partidos')
        .delete()
        .eq('id', id); // 'eq' significa "igual a"

    if (error) {
        alert("No se pudo borrar: " + error.message);
    } else {
        alert("Partido eliminado correctamente");
        location.reload(); // Recarga para que ya no se vea en la lista
    }
}

// BORRAR TODO (CUIDADO: Esto limpia la tabla completa)
async function limpiarTodaLaTabla() {
    const confirmar = confirm("¿Estás seguro de borrar TODA la jornada?");
    if (confirmar) {
        const { error } = await _supabase
            .from('Partidos')
            .delete()
            .neq('id', 0); // Borra todo lo que NO tenga ID 0 (o sea, todo)

        alert("Jornada limpiada");
    }
}

