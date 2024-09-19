import React, { useEffect, useState } from 'react';
import { useFirebase } from '../context/firebase'; // Assuming Firebase context provides a method to fetch users

const CreateChannelComponent = ({ handleUserClick }) => {
    const firebase = useFirebase(); // Firebase instance to get user data
    const [users, setUsers] = useState([]);

    // Fetch all users from Firebase on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersList = await firebase.getAllUsers(); // Assuming this method fetches all users from Firebase
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [firebase]);

    return (
        <div className="p-4 bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Start a Conversation</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.uid} className="mb-2">
                        <button
                            onClick={() => handleUserClick(user.uid)} // When clicked, call the function passed down as a prop
                            className="w-full text-left p-2 bg-blue-500 text-white rounded"
                        >
                            {user.displayName}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CreateChannelComponent;
