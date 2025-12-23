import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, List } from 'lucide-react'; // Icon alias

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [category, setCategory] = useState('unofficial');
    const [showModal, setShowModal] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [dateEvents, setDateEvents] = useState([]); // Events for selected date
    const [newEvent, setNewEvent] = useState({ title: '', date: '', desc: '', img: '', link: '', category: 'unofficial' });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        const data = await apiFetch('/events');
        if (Array.isArray(data)) {
            setEvents(data);
        } else {
            setEvents([]);
        }
    };

    const [uploading, setUploading] = useState(false);
    const [eventFile, setEventFile] = useState(null);

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.url ? `${baseUrl}${data.url}` : null;
    };


    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            await apiFetch(`/events/${id}`, { method: 'DELETE' });
            setEvents(events.filter(ev => ev._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete event");
        }
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.desc) {
            alert("Please fill in required fields (Title, Date, Desc)!");
            return;
        }

        setUploading(true);
        let imgUrl = newEvent.img || 'images/logoo.jpg';

        if (eventFile) {
            const uploadedUrl = await uploadImage(eventFile);
            if (uploadedUrl) imgUrl = uploadedUrl;
            else {
                alert('Image upload failed');
                setUploading(false);
                return;
            }
        }

        const payload = {
            ...newEvent,
            img: imgUrl,
            link: newEvent.link || '#'
        };

        const result = await apiFetch('/events', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (result._id) {
            setEvents([...events, result]);
            setShowModal(false);
            setNewEvent({ title: '', date: '', desc: '', img: '', link: '', category: 'unofficial' });
            setEventFile(null);
        } else {
            alert('Error adding event: ' + (result.message || 'Unknown error'));
        }
        setUploading(false);
    };

    const filteredEvents = events.filter(e => (e.category || 'unofficial') === category);
    const now = new Date();
    const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= now);
    const pastEvents = filteredEvents.filter(e => new Date(e.date) < now);

    const onDateChange = (date) => {
        const selectedDateStr = date.toDateString();
        const eventsOnDate = filteredEvents.filter(e => new Date(e.date).toDateString() === selectedDateStr);
        setDateEvents(eventsOnDate);
    };

    // Helper to highlight dates with events
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            if (filteredEvents.find(e => new Date(e.date).toDateString() === date.toDateString())) {
                return 'highlighted-date';
            }
        }
    };

    return (
        <main>
            {/* Controls Wrapped in Glass Box */}
            <div className="glass-header-box">
                <div style={{ marginBottom: '10px' }}>
                    <button
                        className="cta-btn"
                        style={{ background: category === 'official' ? 'linear-gradient(45deg, #ff416c, #ff4b2b)' : '#333', marginRight: '10px' }}
                        onClick={() => setCategory('official')}
                    >
                        Official
                    </button>
                    <button
                        className="cta-btn"
                        style={{ background: category === 'unofficial' ? 'linear-gradient(45deg, #ff416c, #ff4b2b)' : '#333' }}
                        onClick={() => setCategory('unofficial')}
                    >
                        Unofficial
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: view === 'list' ? 1 : 0.5 }}>
                        <List color="#333" size={24} />
                    </button>
                    <button onClick={() => setView('calendar')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: view === 'calendar' ? 1 : 0.5 }}>
                        <CalendarIcon color="#333" size={24} />
                    </button>
                    {user && <button className="add-btn" onClick={() => setShowModal(true)} style={{ marginLeft: '15px' }}>Add Event +</button>}
                </div>
            </div>

            {view === 'calendar' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                    <div className="calendar-container glass-header-box" style={{ padding: '20px', borderRadius: '15px', color: '#333' }}>
                        <Calendar
                            onChange={onDateChange}
                            tileClassName={tileClassName}
                        />
                    </div>
                    <div style={{ marginTop: '30px', width: '100%', maxWidth: '800px' }}>
                        <h3>Events on Selected Date:</h3>
                        {dateEvents.length > 0 ? (
                            <div className="events-grid">
                                {dateEvents.map(event => (
                                    <div key={event._id || Math.random()} className="event-card" onClick={() => window.open(event.link, '_blank')}>
                                        <img src={event.img} alt={event.title} className="event-img" onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }} />
                                        <div className="event-content">
                                            <span className="event-date-badge">{new Date(event.date).toDateString()}</span>
                                            <h3 className="event-title">{event.title}</h3>
                                            <p className="event-desc">{event.desc}</p>
                                            {user && (
                                                <button onClick={(e) => handleDelete(e, event._id)} style={{ marginTop: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', float: 'right' }}>
                                                    Delete 🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ textAlign: 'center', marginTop: '10px' }}>Select a date to view events.</p>}
                    </div>
                </div>
            ) : (
                <>

                    <h2 className="section-title">Upcoming Events 📅</h2>
                    <div className="events-grid">
                        {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                            <div key={event._id || Math.random()} className="event-card" onClick={() => window.open(event.link, '_blank')}>
                                <img src={event.img} alt={event.title} className="event-img" onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }} />
                                <div className="event-content">
                                    <span className="event-date-badge">{new Date(event.date).toDateString()}</span>
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-desc">{event.desc}</p>
                                    {user && (
                                        <button onClick={(e) => handleDelete(e, event._id)} style={{ marginTop: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', float: 'right' }}>
                                            Delete 🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : <p>No upcoming events.</p>}
                    </div>

                    <br /><br />

                    <h2 className="section-title">Past Highlights 🏆</h2>
                    <div className="events-grid">
                        {pastEvents.length > 0 ? pastEvents.map(event => (
                            <div key={event._id || Math.random()} className="event-card" onClick={() => window.open(event.link, '_blank')}>
                                <img src={event.img} alt={event.title} className="event-img" onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }} />
                                <div className="event-content">
                                    <span className="event-date-badge">{new Date(event.date).toDateString()}</span>
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-desc">{event.desc}</p>
                                    {user && (
                                        <button onClick={(e) => handleDelete(e, event._id)} style={{ marginTop: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', float: 'right' }}>
                                            Delete 🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : <p>No past events recorded.</p>}
                    </div>
                </>
            )}


            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>X</button>
                        <h3>Add New Event</h3>
                        <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                        <input type="text" placeholder="Date (e.g. 2025-12-31)" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />

                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Event Image:</label>
                            <input type="file" accept="image/*" onChange={(e) => setEventFile(e.target.files[0])} />
                            <p style={{ fontSize: '0.8em', margin: '5px 0' }}>OR</p>
                            <input type="text" placeholder="Image URL" value={newEvent.img} onChange={e => setNewEvent({ ...newEvent, img: e.target.value })} />
                        </div>

                        <input type="text" placeholder="Link" value={newEvent.link} onChange={e => setNewEvent({ ...newEvent, link: e.target.value })} />
                        <select
                            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px' }}
                            value={newEvent.category}
                            onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                        >
                            <option value="unofficial">Unofficial (Personal)</option>
                            <option value="official">Official (Project/Work)</option>
                        </select>
                        <textarea
                            rows="3"
                            placeholder="Description..."
                            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '2px solid #ccc' }}
                            value={newEvent.desc}
                            onChange={e => setNewEvent({ ...newEvent, desc: e.target.value })}
                        ></textarea>
                        <button className="add-btn" onClick={handleAddEvent} disabled={uploading}>
                            {uploading ? 'Posting...' : 'Post Event'}
                        </button>
                    </div>
                </div>
            )
            }
        </main >
    );
};

export default Events;
