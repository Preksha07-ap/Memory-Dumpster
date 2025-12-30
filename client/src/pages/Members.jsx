import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Members = () => {
    const { user } = useAuth();

    const [members, setMembers] = useState([]);

    React.useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Assuming you have apiFetch utility or use fetch directly
                // If apiFetch is not imported, imports need update too. using fetch for simplicity if apiFetch not available in view.
                // Wait, apiFetch IS available check if imported.
                // Based on previous views, apiFetch might be in utils. Checking imports.
                const baseUrl = import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${baseUrl}/api/members`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMembers(data);
                }
            } catch (error) {
                console.error("Failed to load members", error);
            }
        };
        fetchMembers();
    }, []);

    return (
        <main style={{ maxWidth: '1200px' }}>
            <div className="glass-header-box">
                <h2 style={{ color: '#222', textShadow: 'none', marginBottom: 0 }} className="section-title">Community Members</h2>
            </div>

            <div className="members-grid">

                {user && (
                    <div className="member-card">
                        <img
                            src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                            alt="Avatar"
                            className="member-avatar"
                        />
                        <h3 className="member-name">
                            {user.name}
                            <span style={{ fontSize: '0.6em', verticalAlign: 'middle', background: 'gold', padding: '2px 6px', borderRadius: '4px', color: 'black', marginLeft: '5px' }}>YOU</span>
                        </h3>
                        <div className="member-role">{user.work}</div>
                        <div className="member-qual">{user.qualification}</div>

                        <Link to="/profile-setup" style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>✏️ Edit Profile</Link>
                        <br /><br />

                        <div className="social-links">
                            {user.linkedin && user.linkedin !== '#' && <a href={user.linkedin} target="_blank" rel="noreferrer" className="social-btn linkedin">LinkedIn</a>}
                            {user.github && user.github !== '#' && <a href={user.github} target="_blank" rel="noreferrer" className="social-btn github">GitHub</a>}
                        </div>
                    </div>
                )}

                {members.filter(member => {
                    const isIdMatch = user?._id && member._id === user._id;
                    const isEmailMatch = member.email?.toLowerCase() === user?.email?.toLowerCase();
                    const isNameMatch = member.name?.toLowerCase() === user?.name?.toLowerCase();
                    // Filter out if ANY match (ID, Email, or Name) to prevent duplicates
                    return !(isIdMatch || isEmailMatch || isNameMatch);
                }).map((member, idx) => (
                    <div key={idx} className="member-card">
                        <img
                            src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`}
                            alt="Avatar"
                            className="member-avatar"
                        />
                        <h3 className="member-name">{member.name}</h3>
                        <div className="member-role">{member.work}</div>
                        <div className="member-qual">{member.qualification}</div>

                        <div className="social-links" style={{ marginTop: '15px' }}>
                            {member.linkedin && member.linkedin !== '#' && <a href={member.linkedin} target="_blank" rel="noreferrer" className="social-btn linkedin">LinkedIn</a>}
                            {member.github && member.github !== '#' && <a href={member.github} target="_blank" rel="noreferrer" className="social-btn github">GitHub</a>}
                        </div>
                        {user && (
                            <button
                                onClick={async () => {
                                    if (!window.confirm(`Are you sure you want to remove ${member.name}?`)) return;
                                    try {
                                        const baseUrl = import.meta.env.VITE_API_URL || '';
                                        const res = await fetch(`${baseUrl}/api/members/${member._id}`, { method: 'DELETE' });
                                        if (res.ok) {
                                            setMembers(members.filter(m => m._id !== member._id));
                                        } else {
                                            const txt = await res.text();
                                            alert("Failed to delete member: " + txt);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Error deleting member");
                                    }
                                }}
                                style={{ marginTop: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'block', width: '100%' }}
                            >
                                Remove Member
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
};

export default Members;
