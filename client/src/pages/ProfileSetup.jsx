import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Modal from '../components/Modal';

const ProfileSetup = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        work: '',
        qualification: '',
        linkedin: '',
        github: '',
        img: ''
    });

    const [uploading, setUploading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCloseModal = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.type === 'success') {
            navigate('/');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${baseUrl}/api/upload`, {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (result.url) {
                setFormData({ ...formData, img: `${baseUrl}${result.url}` });
            }
        } catch (error) {
            console.error("Upload failed", error);
            setModal({ isOpen: true, title: 'Upload Error', message: 'Upload failed: ' + error.message, type: 'error' });
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                login(data.user);
                navigate('/');
            } else {
                setModal({ isOpen: true, title: 'Error', message: data.message, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setModal({ isOpen: true, title: 'Connection Error', message: 'Save Failed: ' + err.message, type: 'error' });
        }
    };

    return (
        <main>
            <Modal
                isOpen={modal.isOpen}
                onClose={handleCloseModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
            <div className="form-container">
                <h2>Create Your Profile</h2>
                <p>Share your details with the community!</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="img">Profile Picture</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {formData.img && <img src={formData.img} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />}
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        {uploading && <small>Uploading...</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" name="name" id="name" required placeholder="e.g. John Doe" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Gmail / Email</label>
                        <input type="email" name="email" id="email" required placeholder="example@gmail.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="work">Present Work</label>
                        <input type="text" name="work" id="work" required placeholder="e.g. Software Engineer at Google" value={formData.work} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="qualification">Qualification</label>
                        <input type="text" name="qualification" id="qualification" required placeholder="e.g. B.Tech in CSE" value={formData.qualification} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="linkedin">LinkedIn URL (Optional)</label>
                        <input type="url" name="linkedin" id="linkedin" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="github">GitHub URL (Optional)</label>
                        <input type="url" name="github" id="github" placeholder="https://github.com/..." value={formData.github} onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn" disabled={uploading}>{uploading ? 'Uploading...' : 'Save Profile'}</button>
                </form>
            </div>
        </main>
    );
};

export default ProfileSetup;
