
// global.js - El "cerebro" de tus temas
(function() {
    function aplicarTema() {
        const temaGuardado = localStorage.getItem('theme');
        if (temaGuardado === 'blue') {
            document.documentElement.setAttribute('data-theme', 'blue');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // Ejecutar al cargar
    aplicarTema();

    // Escuchar si el tema cambia en otra pestaña/ventana
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') aplicarTema();
    });
})();

