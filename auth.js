const URL_PROYECTO = 'https://rvbjdtqjlznshijyfacv.supabase.co';
const LLAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmpkdHFqbHpuc2hpanlmYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA3NzAsImV4cCI6MjA5MDc0Njc3MH0.-wa0UpyQZBJ2uZVp0qhwcGD30OVhZxRLRO5JpLJuAWQ';

const _supabase = supabase.createClient(URL_PROYECTO, LLAVE_ANON);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    const errorDiv = document.getElementById('error');

    // Consultamos la tabla Usuarios
    const { data, error } = await _supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', user)
        .eq('contrasena', pass)
        .single(); // Esperamos solo un resultado

    if (data) {
        // ¡ÉXITO! Guardamos en la memoria del navegador que ya entró
        sessionStorage.setItem('sesion_activa', 'true');
        window.location.href = 'index.html'; // Aquí mandamos al index
    } else {
        errorDiv.style.display = 'block';
        // Animación de sacudida si falla
        document.querySelector('.login-card').animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
    }
});
