async function enviarABookmarks(urlFinal) {
    const apiUrl = 'http://localhost:3000/api/v1/bookmarks';

    // NOTA: Los archivos .env no funcionan directamente en el navegador. 
    // Puedes poner tu token aquí o usar chrome.storage.
    const token = 'INGRESA_TU_TOKEN_AQUI';

    if (!token || token === 'INGRESA_TU_TOKEN_AQUI') {
        console.error('Error: El token no está configurado en request.js');
        return;
    }

    const payload = {
        type: 'link',
        url: urlFinal
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Bookmark creado con éxito en Karakeep:', data);
        return data;
    } catch (error) {
        console.error('Error al enviar a Karakeep:', error);
    }
}