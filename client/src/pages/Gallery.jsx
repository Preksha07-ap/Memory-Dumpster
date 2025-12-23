import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Trash2 } from 'lucide-react';
import { getAlbums, createAlbum, addPhotos, likePhoto, deleteAlbum, deletePhoto } from '../services/galleryService';

// ... (existing code)

const handleDeleteAlbum = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this album?")) return;

    try {
        await deleteAlbum(id);
        setAlbums(albums.filter(a => (a._id || a.id) !== id));
        if (currentAlbumId === id) {
            setCurrentAlbumId(null);
            setView('albums');
        }
    } catch (error) {
        console.error("Delete album failed", error);
        alert("Failed to delete album");
    }
};

const handleDeletePhoto = async (e, photo) => {
    e.stopPropagation(); // Lightbox handling
    if (!window.confirm("Delete this photo?")) return;

    const albumId = currentAlbumId;
    const photoId = photo._id || photo.id;

    try {
        await deletePhoto(albumId, photoId);

        // Update state
        const updatedAlbums = albums.map(alb => {
            if (alb._id === albumId || alb.id === albumId) {
                return {
                    ...alb,
                    photos: alb.photos.filter(p => (p._id || p.id) !== photoId)
                };
            }
            return alb;
        });
        setAlbums(updatedAlbums);
        setSelectedPhoto(null); // Close lightbox if open
    } catch (error) {
        console.error("Delete photo failed", error);
        alert("Failed to delete photo");
    }
};
import { uploadImage, uploadMultipleImages } from '../services/uploadService';

const Gallery = () => {
    const { user } = useAuth();
    const [view, setView] = useState('albums');
    const [category, setCategory] = useState('unofficial');
    const [currentAlbumId, setCurrentAlbumId] = useState(null);
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Import or define apiFetch if not already available
    // Assuming apiFetch is needed, let's look at imports. 
    // Wait, I need to check if apiFetch is imported. 
    // The previous view showed it wasn't imported in Gallery.jsx.
    // I should add the import first.

    const [albums, setAlbums] = useState([]);

    React.useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const data = await getAlbums();
                if (Array.isArray(data)) {
                    setAlbums(data);
                }
            } catch (error) {
                console.error("Failed to load albums", error);
            }
        };
        fetchAlbums();
    }, []);

    const [uploading, setUploading] = useState(false);
    const [newAlbum, setNewAlbum] = useState({ title: '', date: '', cover: '', category: 'unofficial' });
    const [newPhoto, setNewPhoto] = useState({ url: '', desc: '' });
    // Updated state for multiple files
    const [photoFiles, setPhotoFiles] = useState([]);
    const [albumFile, setAlbumFile] = useState(null);

    const handleFileChange = (e, type) => {
        if (type === 'album') {
            setAlbumFile(e.target.files[0]);
        } else if (type === 'photo') {
            // Convert FileList to Array
            setPhotoFiles(Array.from(e.target.files));
        }
    };

    const handleUploadImageHelper = async (file) => {
        return await uploadImage(file);
    };

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setView('albums');
        setCurrentAlbumId(null);
    };

    const handleCreateAlbum = async () => {
        if (!newAlbum.title || (!albumFile && !newAlbum.cover)) {
            alert("Title and Cover Image are required!");
            return;
        }

        setUploading(true);
        let coverUrl = newAlbum.cover;

        if (albumFile) {
            const uploadedUrl = await handleUploadImageHelper(albumFile);
            if (uploadedUrl) coverUrl = uploadedUrl;
            else {
                alert('Image upload failed');
                setUploading(false);
                return;
            }
        }

        try {
            const createdAlbum = await createAlbum({ ...newAlbum, cover: coverUrl });

            if (createdAlbum._id) {
                createdAlbum.photos = [];
                setAlbums([...albums, createdAlbum]);
                setNewAlbum({ title: '', date: '', cover: '', category: 'unofficial' });
                setAlbumFile(null);
                setShowAlbumModal(false);
            } else {
                alert('Error creating album');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create album');
        } finally {
            setUploading(false);
        }
    };

    const handleAddPhoto = async () => {
        if ((photoFiles.length === 0 && !newPhoto.url) || !newPhoto.desc) {
            alert("Please provide Image(s) and Description!");
            return;
        }

        setUploading(true);
        let photosToAdd = [];

        // 1. Handle URL input
        if (newPhoto.url) {
            photosToAdd.push({ src: newPhoto.url, caption: newPhoto.desc });
        }

        // 2. Handle File Uploads (Multiple)
        if (photoFiles.length > 0) {
            const formData = new FormData();
            photoFiles.forEach(file => {
                formData.append('images', file);
            });

            try {
                const uploadData = await uploadMultipleImages(photoFiles);

                if (uploadData.urls) {
                    const uploadedPhotos = uploadData.urls.map(url => ({
                        src: `${import.meta.env.VITE_API_URL || ''}${url}`,
                        caption: newPhoto.desc // Use same caption for batch
                    }));
                    photosToAdd = [...photosToAdd, ...uploadedPhotos];
                }
            } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload images");
                setUploading(false);
                return;
            }
        }

        try {
            const updatedAlbum = await addPhotos(currentAlbumId, photosToAdd);

            if (updatedAlbum._id) {
                const updatedAlbums = albums.map(album => {
                    if (album._id === currentAlbumId || album.id === currentAlbumId) {
                        return updatedAlbum;
                    }
                    return album;
                });
                setAlbums(updatedAlbums);
                setNewPhoto({ url: '', desc: '' });
                setPhotoFiles([]); // Clear files
                setShowPhotoModal(false);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to add photos');
        } finally {
            setUploading(false);
        }
    };

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const handleLikePhoto = async (e, photo) => {
        e.stopPropagation(); // Prevent opening lightbox
        if (!user) {
            alert("Please login to like photos!");
            return;
        }

        const albumId = currentAlbumId; // Uses closure state
        const photoId = photo._id || photo.id;
        const userId = user._id || user.id;

        // Optimistic UI
        const updatedAlbums = albums.map(alb => {
            if (alb._id === albumId || alb.id === albumId) {
                const updatedPhotos = alb.photos.map(p => {
                    if ((p._id || p.id) === photoId) {
                        const isLiked = p.likes && p.likes.includes(userId);
                        let newLikes = p.likes ? [...p.likes] : [];
                        if (isLiked) newLikes = newLikes.filter(id => id !== userId);
                        else newLikes.push(userId);
                        return { ...p, likes: newLikes };
                    }
                    return p;
                });
                return { ...alb, photos: updatedPhotos };
            }
            return alb;
        });
        setAlbums(updatedAlbums);

        try {
            const updatedAlbum = await likePhoto(albumId, photoId, userId);
            if (updatedAlbum._id) {
                setAlbums(prev => prev.map(a => a._id === updatedAlbum._id ? updatedAlbum : a));
            }
        } catch (error) {
            console.error("Like photo failed", error);
        }
    };

    const filteredAlbums = albums.filter(a => a.category === category);
    const currentAlbum = albums.find(a => a._id === currentAlbumId || a.id === currentAlbumId);

    return (
        <main>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="glass-header-box">
                    <div className="category-switch-container">
                        <button
                            className="cta-btn"
                            style={{ background: category === 'official' ? 'linear-gradient(45deg, #ff416c, #ff4b2b)' : '#333', marginRight: '10px' }}
                            onClick={() => handleCategoryChange('official')}
                        >
                            Official
                        </button>
                        <button
                            className="cta-btn"
                            style={{ background: category === 'unofficial' ? 'linear-gradient(45deg, #ff416c, #ff4b2b)' : '#333' }}
                            onClick={() => handleCategoryChange('unofficial')}
                        >
                            Unofficial
                        </button>
                    </div>

                    {user && (
                        view === 'albums' ? (
                            <button className="add-btn" onClick={() => setShowAlbumModal(true)}>Create New Album +</button>
                        ) : (
                            <button className="add-btn" onClick={() => setShowPhotoModal(true)}>Add Photo +</button>
                        )
                    )}
                </div>

                {view === 'photos' && (
                    <button className="cta-btn" onClick={() => { setView('albums'); setCurrentAlbumId(null); }} style={{ padding: '8px 20px', fontSize: '1rem', marginBottom: '15px' }}>
                        ← Back to Albums
                    </button>
                )}
            </div>


            <div className="gallery">
                {view === 'albums' ? (
                    filteredAlbums.length > 0 ? (
                        filteredAlbums.map(album => (
                            <div key={album._id || album.id} className="album-card" onClick={() => { setCurrentAlbumId(album._id || album.id); setView('photos'); }}>
                                <img src={album.cover} alt={album.title} className="album-cover" onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }} />
                                <div className="album-info">
                                    <h3>{album.title}</h3>
                                    <span>{album.photos?.length || 0} Photos</span>
                                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>{album.date}</span>
                                    {user && (
                                        <button onClick={(e) => handleDeleteAlbum(e, album._id || album.id)} style={{ marginTop: '5px', background: 'none', border: 'none', cursor: 'pointer', float: 'right', color: 'red' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', width: '100%', gridColumn: '1/-1' }}>No albums found in this category.</p>
                    )
                ) : (
                    currentAlbum && currentAlbum.photos.map((photo, idx) => (
                        <div key={idx} className="gallery-item" onClick={() => setSelectedPhoto(photo)} style={{ cursor: 'pointer', position: 'relative' }}>
                            <img src={photo.src} alt={photo.desc} onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }} />
                            <div className="desc">
                                {photo.desc}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5px', gap: '5px' }}>
                                    <Heart
                                        size={16}
                                        fill={photo.likes?.includes(user?._id || user?.id) ? "#ff4757" : "none"}
                                        color="#ff4757"
                                        onClick={(e) => handleLikePhoto(e, photo)}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{photo.likes?.length || 0}</span>
                                </div>
                            </div>
                            {user && (
                                <button
                                    onClick={(e) => handleDeletePhoto(e, photo)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(255, 0, 0, 0.7)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Trash2 size={16} color="white" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>


            {showAlbumModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowAlbumModal(false)}>X</button>
                        <h3>Create New Album</h3>
                        <input type="text" placeholder="Album Title" value={newAlbum.title} onChange={e => setNewAlbum({ ...newAlbum, title: e.target.value })} />
                        <input type="text" placeholder="Date" value={newAlbum.date} onChange={e => setNewAlbum({ ...newAlbum, date: e.target.value })} />

                        {/* File Upload for Cover */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Cover Image:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'album')} />
                            <p style={{ fontSize: '0.8em', margin: '5px 0' }}>OR</p>
                            <input type="text" placeholder="Image URL (optional)" value={newAlbum.cover} onChange={e => setNewAlbum({ ...newAlbum, cover: e.target.value })} />
                        </div>
                        <select
                            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px' }}
                            value={newAlbum.category}
                            onChange={e => setNewAlbum({ ...newAlbum, category: e.target.value })}
                        >
                            <option value="unofficial">Unofficial (Personal)</option>
                            <option value="official">Official (Project/Work)</option>
                        </select>
                        <button className="add-btn" onClick={handleCreateAlbum} disabled={uploading}>
                            {uploading ? 'Creating...' : 'Create Album'}
                        </button>
                    </div>
                </div>
            )}


            {showPhotoModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowPhotoModal(false)}>X</button>
                        <h3>Add New Photo</h3>

                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Select Photo(s) (Max 10):</label>
                            <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'photo')} />
                            <p style={{ fontSize: '0.8em', margin: '5px 0' }}>OR</p>
                            <input type="text" placeholder="Image URL" value={newPhoto.url} onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} />
                        </div>

                        <input type="text" placeholder="Description" value={newPhoto.desc} onChange={e => setNewPhoto({ ...newPhoto, desc: e.target.value })} />
                        <button className="add-btn" onClick={handleAddPhoto} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Post Memory'}
                        </button>
                    </div>
                </div>
            )}

            {/* LIGHTBOX OVERLAY */}
            {selectedPhoto && (
                <div className="image-lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
                    <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>&times;</button>
                    <img
                        src={selectedPhoto.src}
                        alt={selectedPhoto.desc}
                        className="lightbox-img"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Image+Load+Error'; }}
                    />
                    {selectedPhoto.desc && <div className="lightbox-caption">{selectedPhoto.desc}</div>}
                    {user && (
                        <button
                            className="lightbox-delete"
                            style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'red', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', zIndex: 1001 }}
                            onClick={(e) => handleDeletePhoto(e, selectedPhoto)}
                        >
                            Delete Photo 🗑️
                        </button>
                    )}
                </div>
            )}

        </main>
    );
};

export default Gallery;
