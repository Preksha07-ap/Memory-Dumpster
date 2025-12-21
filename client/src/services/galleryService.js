const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/gallery` : '/api/gallery';

export const getAlbums = async () => {
    const response = await fetch(API_URL);
    return response.json();
};

export const createAlbum = async (albumData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(albumData),
    });
    return response.json();
};

export const addPhotos = async (albumId, photos) => {
    const response = await fetch(`${API_URL}/${albumId}/photos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos }),
    });
    return response.json();
};

export const likePhoto = async (albumId, photoId, userId) => {
    const response = await fetch(`${API_URL}/${albumId}/photos/${photoId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    return response.json();
};
