const API_URL = 'http://localhost:5000/api/upload';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
    });
    const data = await response.json();
    return data.url ? `http://localhost:5000${data.url}` : null;
};

export const uploadMultipleImages = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('images', file);
    });

    const response = await fetch(`${API_URL}/multiple`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
};
