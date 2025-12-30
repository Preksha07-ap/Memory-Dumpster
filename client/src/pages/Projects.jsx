import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';

const Projects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', desc: '', stack: '', img: '', github: '' });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const data = await apiFetch('/projects');
        if (Array.isArray(data)) {
            setProjects(data);
        } else {
            setProjects([]);
        }
    };

    const [uploading, setUploading] = useState(false);
    const [projectFile, setProjectFile] = useState(null);

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.url ? `${baseUrl}${data.url}` : null;
    };

    const handleLike = async (projectId) => {
        if (!user) {
            alert("Please login to like projects!");
            return;
        }

        // Optimistic UI Update
        const updatedProjects = projects.map(p => {
            if (p._id === projectId) {
                const userId = user._id || user.id; // Ensure we have ID
                const isLiked = p.likes && p.likes.includes(userId);
                let newLikes = p.likes ? [...p.likes] : [];

                if (isLiked) {
                    newLikes = newLikes.filter(id => id !== userId);
                } else {
                    newLikes.push(userId);
                }
                return { ...p, likes: newLikes };
            }
            return p;
        });
        setProjects(updatedProjects);

        try {
            const res = await apiFetch(`/projects/${projectId}/like`, {
                method: 'POST',
                body: JSON.stringify({ userId: user._id || user.id })
            });
            // Sync with server only if needed, but optimistic is usually fine.
            // Ideally we should use the server response to be sure.
            if (res._id) {
                // Update again with true server state
                setProjects(prev => prev.map(p => p._id === res._id ? res : p));
            }
        } catch (error) {
            console.error("Like failed", error);
            // Revert on error could be implemented here
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        try {
            await apiFetch(`/projects/${id}`, { method: 'DELETE' });
            setProjects(projects.filter(p => p._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete project");
        }
    };

    const handleAddProject = async () => {
        if (!newProject.title) {
            alert("Title is required!");
            return;
        }

        setUploading(true);
        let imgUrl = newProject.img || 'images/logoo.jpg';

        if (projectFile) {
            const uploadedUrl = await uploadImage(projectFile);
            if (uploadedUrl) imgUrl = uploadedUrl;
            else {
                alert('Image upload failed');
                setUploading(false);
                return;
            }
        }

        const stackArray = newProject.stack.split(',').map(s => s.trim()).filter(s => s);

        const payload = {
            ...newProject,
            stack: stackArray.length ? stackArray : ['New'],
            img: imgUrl,
            github: newProject.github || ''
        };

        const result = await apiFetch('/projects', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (result._id) {
            setProjects([...projects, result]);
            setShowModal(false);
            setNewProject({ title: '', desc: '', stack: '', img: '', github: '' });
            setProjectFile(null);
        } else {
            alert('Error adding project: ' + (result.message || 'Unknown'));
        }
        setUploading(false);
    };

    const getGithubLink = (link) => {
        if (!link) return '#';
        let result = link.trim();
        // Normalize by removing existing protocol/domain prefixes to isolate the path
        result = result.replace(/^(https?:\/\/)?(www\.)?github\.com\s*\/?\s*/, '');
        return `https://github.com/${result}`;
    };

    return (
        <main style={{ paddingTop: '20px' }}>
            <div className="glass-header-box">
                <h2 className="section-title" style={{ marginBottom: '15px' }}>Our Projects 🚀</h2>
                {user && <button className="add-btn" onClick={() => setShowModal(true)}>Add Project +</button>}
            </div>

            <div className="events-grid" id="projects-grid">
                {projects.map(proj => (
                    <div key={proj._id || Math.random()} className="project-card">
                        <img src={proj.img} alt={proj.title} className="project-img" onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }} />
                        <div className="project-content">
                            <h3 className="project-title">{proj.title}</h3>
                            <p className="project-desc">{proj.desc}</p>
                            <div className="tech-stack">
                                {Array.isArray(proj.stack) && proj.stack.map((tech, idx) => (
                                    <span key={idx} className="tech-badge">{tech}</span>
                                ))}
                            </div>
                            <div className="project-actions">
                                {proj.github && proj.github !== '#' ? (
                                    <a href={getGithubLink(proj.github)} target="_blank" rel="noopener noreferrer" className="action-btn github">View Code</a>
                                ) : (
                                    <button className="action-btn github" onClick={() => alert("No GitHub link provided for this project")} style={{ opacity: 0.6 }}>View Code</button>
                                )}
                                <button className="like-btn" onClick={() => handleLike(proj._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Heart size={20} fill={proj.likes?.includes(user?._id || user?.id) ? "#ff4757" : "none"} color="#ff4757" />
                                    <span>{proj.likes?.length || 0}</span>
                                </button>
                                {user && (
                                    <button className="delete-btn" onClick={() => handleDelete(proj._id)} style={{ background: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px', color: 'white', marginLeft: 'auto' }}>
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>X</button>
                        <h3>Add New Project</h3>
                        <input type="text" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                        <input type="text" placeholder="Short Description" value={newProject.desc} onChange={e => setNewProject({ ...newProject, desc: e.target.value })} />
                        <input type="text" placeholder="Tech Stack (comma separated)" value={newProject.stack} onChange={e => setNewProject({ ...newProject, stack: e.target.value })} />

                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Project Image:</label>
                            <input type="file" accept="image/*" onChange={(e) => setProjectFile(e.target.files[0])} />
                            <p style={{ fontSize: '0.8em', margin: '5px 0' }}>OR</p>
                            <input type="text" placeholder="Image URL" value={newProject.img} onChange={e => setNewProject({ ...newProject, img: e.target.value })} />
                        </div>

                        <input type="text" placeholder="GitHub URL" value={newProject.github} onChange={e => setNewProject({ ...newProject, github: e.target.value })} />

                        <button className="add-btn" onClick={handleAddProject} disabled={uploading}>
                            {uploading ? 'Adding...' : 'Add Project'}
                        </button>
                    </div>
                </div>
            )}

        </main>
    );
};

export default Projects;
