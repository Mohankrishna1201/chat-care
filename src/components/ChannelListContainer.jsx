import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/firebase';
import { useNavigate } from "react-router-dom";

export default function ChannelListContainer() {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getUser = async () => {
        setLoading(true);
        try {
            const result = await firebase.getUserDetails();
            setUser(result);
        } catch (err) {
            setError('Failed to fetch user details');
            console.error('Error fetching user details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await firebase.UserLogout();
            alert('Logged out successfully');
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Channel List Container</h1>
            <button onClick={handleLogout}>Logout</button>
            {user ? (
                <div>
                    <p><strong>User ID:</strong> {user.userID}</p>
                    <p><strong>Email:</strong> {user.userEmail}</p>
                    <p><strong>Token:</strong> {user.userToken}</p>
                    <p>{user.name}</p>
                    <img src={user.userImg} />

                </div>
            ) : (
                <p>No user details available</p>
            )}
        </div>
    );
}
