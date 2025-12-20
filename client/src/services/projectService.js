const API_URL = 'http://localhost:5000/api/projects';

export const getProjects = async () => {
    const response = await fetch(API_URL);
    return response.json();
};

export const createProject = async (projectData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
    });
    return response.json();
};

export const likeProject = async (id, userId) => {
    const response = await fetch(`${API_URL}/${id}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    return response.json();
};
