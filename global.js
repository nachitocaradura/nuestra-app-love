// global.js - El "cerebro" compartido de tu app
(function() {
    // 1. GESTIÓN DE TEMAS (Rosa/Azul)
    function aplicarTema() {
        const temaGuardado = localStorage.getItem('theme');
        if (temaGuardado === 'blue') {
            document.documentElement.setAttribute('data-theme', 'blue');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // 2. CREACIÓN DEL SPINNER (Corazón latiendo)
    function crearSpinner() {
        if (document.getElementById('global-loader')) return;

        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.style = `
            position: fixed; inset: 0; background: var(--pink-bg);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000; transition: opacity 0.5s ease;
        `;

        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style = `
            font-size: 60px;
            animation: beat 1.2s infinite;
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes beat {
                0% { transform: scale(1); }
                30% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            .back-btn-global {
                position: fixed; left: 18px; top: 55px;
                text-decoration: none; font-size: 24px;
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(8px); width: 45px; height: 45px;
                border-radius: 15px; color: var(--pink-accent);
                font-weight: 900; box-shadow: 0 4px 12px var(--shadow);
                display: flex; align-items: center; justify-content: center;
                z-index: 999; transition: 0.3s;
            }
            .back-btn-global:active { transform: scale(0.9); }
        `;

        document.head.appendChild(style);
        loader.appendChild(heart);
        document.body.appendChild(loader);

        // Función global para quitar el loader desde cualquier script
        window.quitarLoader = () => {
            const el = document.getElementById('global-loader');
            if (el) {
                el.style.opacity = '0';
                setTimeout(() => el.remove(), 500);
            }
        };
    }

    // 3. INYECCIÓN DEL BOTÓN "ATRÁS" AUTOMÁTICO
    function inyectarBotonAtras() {
        const ruta = window.location.pathname;
        const pagina = ruta.split("/").pop();
        const excluir = ["index.html", "auth.html", "login.html", ""];

        if (!excluir.includes(pagina)) {
            // Solo lo crea si no existe ya uno manualmente
            if (!document.querySelector('.back-btn') && !document.querySelector('.back-btn-global')) {
                const btn = document.createElement('a');
                btn.href = "index.html";
                btn.className = "back-btn-global";
                btn.innerHTML = "‹";
                document.body.appendChild(btn);
            }
        }
    }

    // EJECUCIÓN INICIAL
    aplicarTema();

    document.addEventListener('DOMContentLoaded', () => {
        crearSpinner();
        inyectarBotonAtras();
    });

    // Escuchar cambios de tema desde otras pestañas
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') aplicarTema();
    });

})();
