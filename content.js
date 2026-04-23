function obtenerUrlExacta(boton) {
    // 1. Lógica para Instagram
    let articuloIg = boton.closest('article');
    if (articuloIg) {
        let enlaceIg = articuloIg.querySelector('a[href*="/p/"], a[href*="/reel/"]');
        if (enlaceIg) return enlaceIg.href;
    }

    // 2. Lógica para Pinterest (Feed y Grid)
    // Buscamos el contenedor principal de la tarjeta del Pin
    let tarjetaPin = boton.closest('[data-test-id="pin"]') ||
        boton.closest('[role="listitem"]') ||
        boton.closest('.Yl-');

    if (tarjetaPin) {
        let enlacePin = tarjetaPin.querySelector('a[href*="/pin/"]');
        if (enlacePin) return enlacePin.href;
    }

    // Fallback: Subir por el DOM buscando cualquier enlace que contenga /pin/
    let actual = boton;
    while (actual && actual !== document.body) {
        let enlace = actual.querySelector('a[href*="/pin/"]');
        if (enlace) return enlace.href;
        actual = actual.parentElement;
    }

    return window.location.href;
}

function gestionarBotones() {
    let elementos = document.querySelectorAll(
        'svg[aria-label="Guardar"], svg[aria-label="Save"], div[data-test-id="PinBetterSaveButton"]'
    );

    elementos.forEach(elemento => {
        let contenedorOriginal = elemento.tagName.toLowerCase() === 'svg'
            ? (elemento.closest('div[role="button"]') || elemento.closest('button'))
            : elemento;

        if (contenedorOriginal) {
            let barraContenedora = contenedorOriginal.parentNode;

            if (!barraContenedora.querySelector('.btn-karakeep')) {

                let botonKarakeep = document.createElement('button');
                botonKarakeep.className = 'btn-karakeep';
                let imgKarakeep = document.createElement('img');
                imgKarakeep.src = chrome.runtime.getURL('assets/karakeep.svg');
                imgKarakeep.style.width = '18px';
                imgKarakeep.style.height = '18px';
                imgKarakeep.style.display = 'block';
                botonKarakeep.appendChild(imgKarakeep);

                botonKarakeep.style.cssText = `
                    background: #7c7c7cff; 
                    border: none; 
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    cursor: pointer; 
                    border-radius: 4px; 
                    margin-right: 10px; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 999999;
                    pointer-events: auto;
                `;


                const eventosBloqueados = [
                    'click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup',
                    'mouseenter', 'mouseleave', 'mouseover', 'touchstart', 'touchend'
                ];

                eventosBloqueados.forEach(evento => {
                    botonKarakeep.addEventListener(evento, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (evento === 'click') {
                            let urlFinal = obtenerUrlExacta(botonKarakeep);
                            console.log("Acción ejecutada en Karakeep. URL: " + urlFinal);
                            enviarABookmarks(urlFinal);
                        }
                    }, true);
                });

                barraContenedora.insertBefore(botonKarakeep, contenedorOriginal);
            }

            // Mantiene el botón original oculto
            contenedorOriginal.style.display = 'none';
        }
    });
}

const observador = new MutationObserver(gestionarBotones);
observador.observe(document.body, { childList: true, subtree: true });