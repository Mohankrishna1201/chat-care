import React, { useEffect, useState, useRef } from 'react';
import { useFirebase } from '../context/firebase'; // Assuming Firebase context provides a method to fetch users
import "../App.css";

const CreateChannelComponent = ({ handleUserClick }) => {
    const firebase = useFirebase(); // Firebase instance to get user data
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State to track search input
    const inputRef = useRef(null); // Ref to manage input focus

    // Fetch all users from Firebase on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersList = await firebase.getAllUsers();
                // Filter out the current user
                const filteredUsers = usersList.filter(user => user.uid !== firebase.currentUser?.uid);
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [firebase]);

    // Ensure the input field gets focus when the component is mounted
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Filtered users based on the search term
    const filteredUsers = users.filter((user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4" style={{ backgroundColor: '#17191c', zIndex: 50 }}> {/* Ensure zIndex is above any overlays */}
            <h2 className="text-xl font-bold mb-4 text-white">Start a Conversation</h2>

            {/* Search Bar */}
            <input
                type="text"
                ref={inputRef} // Attach the ref to input for focus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a user..."
                className="w-full mb-4 p-2 border border-[#00b8d9] rounded"
                style={{
                    backgroundColor: '#1c1c1c', // Darker background for the input
                    color: '#fff', // White text
                    borderColor: '#00b8d9', // Subtle border color
                    zIndex: 50, // Ensures input is clickable
                }}
            />

            {/* Display filtered users only if search term exists */}
            {searchTerm && (
                <ul
                    className="max-h-64 overflow-y-auto scrollbar-hide" // Add custom class to hide scrollbar
                    style={{ maxHeight: '16rem' }} // Limit height to 16rem (around 256px)
                >
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <li key={user.uid} className="mb-2">
                                <button
                                    onClick={() => handleUserClick(user.uid)} // When clicked, call the function passed down as a prop
                                    className="w-full text-left p-2"
                                    style={{
                                        backgroundColor: '#17191c', // Accent color
                                        color: '#ffffff', // White text
                                    }}
                                >
                                    {user.displayName}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="text-white">No users found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default CreateChannelComponent;
