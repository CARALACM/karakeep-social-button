async function enviarABookmarks(urlFinal, titulo = '', tags = []) {
    const apiUrl = 'http://localhost:3000/api/v1/bookmarks';

    const token = '';

    if (!token || token === '') {
        console.error('Error: El token no está configurado en request.js');
        return;
    }

    const payload = {
        type: 'link',
        url: urlFinal
    };

    if (titulo) {
        payload.title = titulo;
    }


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

        if (tags && tags.length > 0) {
            try {
                // Karakeep requiere llamar a un endpoint separado para agregar tags
                const tagsUrl = `http://localhost:3000/api/v1/bookmarks/${data.id}/tags`;
                const tagsResponse = await fetch(tagsUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    // La API de Karakeep espera un array de objetos indicando el tagName: { tags: [{ tagName: "tag1" }] }
                    body: JSON.stringify({ tags: tags.map(tag => ({ tagName: tag })) })
                });

                if (!tagsResponse.ok) {
                    console.error('Error al agregar tags HTTP:', tagsResponse.status, await tagsResponse.text());
                } else {
                    console.log('Tags agregados con éxito a Karakeep');
                }
            } catch (tagError) {
                console.error('Error al enviar tags a Karakeep:', tagError);
            }
        }

        return data;
    } catch (error) {
        console.error('Error al enviar a Karakeep:', error);
    }
}