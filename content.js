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

function mostrarPopup(boton, url) {
    let popupExistente = document.getElementById('karakeep-popup');
    if (popupExistente) {
        popupExistente.remove();
    }

    let rect = boton.getBoundingClientRect();

    let popup = document.createElement('div');
    popup.id = 'karakeep-popup';
    popup.className = 'karakeep-popup';
    popup.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 5}px;
        left: ${rect.left}px;
        background: #222;
        color: #fff;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        z-index: 9999999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 250px;
        font-family: sans-serif;
    `;

    // Ajustar si el popup se sale de la pantalla
    if (rect.left + 250 > window.innerWidth) {
        popup.style.left = 'auto';
        popup.style.right = '10px';
    }

    let titleLabel = document.createElement('label');
    titleLabel.textContent = 'Guardar en Karakeep';
    titleLabel.style.cssText = `
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 5px;
        color: #ddd;
    `;

    let input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Añadir título (opcional)...';
    input.style.cssText = `
        width: 100%;
        padding: 8px;
        background: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        box-sizing: border-box;
        font-size: 14px;
        outline: none;
    `;

    input.addEventListener('focus', () => {
        input.style.borderColor = '#888';
    });
    input.addEventListener('blur', () => {
        input.style.borderColor = '#555';
    });

    let tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 5px;
    `;

    const availableTags = ['just', 'diy', 'fit', 'home', '3d', 'bike', 'electronics', 'science'];
    const selectedTags = new Set();

    availableTags.forEach(tag => {
        let tagBtn = document.createElement('button');
        tagBtn.textContent = '#' + tag;
        tagBtn.style.cssText = `
            background: #333;
            color: #ccc;
            border: 1px solid #555;
            padding: 4px 8px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        `;
        tagBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
                tagBtn.style.background = '#333';
                tagBtn.style.color = '#ccc';
                tagBtn.style.borderColor = '#555';
            } else {
                selectedTags.add(tag);
                tagBtn.style.background = '#4caf50';
                tagBtn.style.color = 'white';
                tagBtn.style.borderColor = '#4caf50';
            }
        });
        tagsContainer.appendChild(tagBtn);
    });

    let btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 5px;
    `;

    let botonGuardar = document.createElement('button');
    botonGuardar.textContent = 'Guardar';
    botonGuardar.style.cssText = `
        background: #4caf50;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
    `;

    let botonCerrar = document.createElement('button');
    botonCerrar.textContent = 'Cancelar';
    botonCerrar.style.cssText = `
        background: #555;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;

    function clickOutside(e) {
        if (!popup.contains(e.target) && e.target !== boton && !boton.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', clickOutside, true);
        }
    }

    // Prevenir que los eventos del popup se propaguen a la web
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(evento => {
        popup.addEventListener(evento, (e) => {
            e.stopPropagation();
        });
    });

    setTimeout(() => {
        document.addEventListener('click', clickOutside, true);
    }, 10);

    botonGuardar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let titulo = input.value.trim();
        let tagsArray = Array.from(selectedTags);
        enviarABookmarks(url, titulo, tagsArray);
        popup.remove();
        document.removeEventListener('click', clickOutside, true);
    });

    botonCerrar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        popup.remove();
        document.removeEventListener('click', clickOutside, true);
    });

    btnContainer.appendChild(botonCerrar);
    btnContainer.appendChild(botonGuardar);

    popup.appendChild(titleLabel);
    popup.appendChild(input);
    popup.appendChild(tagsContainer);
    popup.appendChild(btnContainer);

    document.body.appendChild(popup);
    input.focus();
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
                            console.log("Abriendo menú Karakeep. URL: " + urlFinal);
                            mostrarPopup(botonKarakeep, urlFinal);
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