const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userField = document.getElementById('user').value.trim(); // .trim() quita espacios accidentales
    const passField = document.getElementById('pass').value.trim();
    const errorDiv = document.getElementById('error');

    console.log("Intentando entrar con:", userField);

    // Buscamos en la tabla Usuarios
    const { data, error } = await _supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', userField)
        .eq('contrasena', passField);

    // Si data tiene algo (es decir, encontró al menos 1 fila)
    if (data && data.length > 0) {
        console.log("¡Usuario encontrado!");
        sessionStorage.setItem('sesion_activa', 'true');
        window.location.href = 'index.html'; 
    } else {
        console.log("No se encontró el usuario o la contraseña falló");
        errorDiv.style.display = 'block';
        
        // Animación de error
        document.querySelector('.login-card').classList.add('shake');
        setTimeout(() => document.querySelector('.login-card').classList.remove('shake'), 500);
    }

    if (error) console.error("Error de Supabase:", error);
});
