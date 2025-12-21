const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/upload` : 'http://localhost:5000/api/upload';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
    });
    const data = await response.json();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return data.url ? `${baseUrl}${data.url}` : null;
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
