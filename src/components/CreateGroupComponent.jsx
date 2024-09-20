import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

const CreateGroupComponent = ({ users, handleGroupCreate, onClose }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSubmit = () => {
        if (!groupName) {
            setError('Group name is required.');
            return;
        }
        if (selectedUsers.length < 2) {
            setError('Select at least two users to create a group.');
            return;
        }
        handleGroupCreate(groupName, selectedUsers);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#17191c] p-6 rounded-md w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg text-white">Create Group</h2>
                    <button onClick={onClose}>
                        <IoClose size={24} className="text-white hover:text-[#00b8d9]" />
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full p-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#00b8d9]"
                    />
                </div>

                <div className="mb-4">
                    <h3 className="text-white mb-2">Select Users</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {users.map((user) => (
                            <div
                                key={user.uid}
                                onClick={() => toggleUserSelection(user.uid)}
                                className={`p-2 bg-gray-800 text-white rounded cursor-pointer transition-colors duration-300 ${selectedUsers.includes(user.uid) ? 'bg-[#00b8d9]' : ''
                                    }`}
                            >
                                {user.displayName}
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <button
                    onClick={handleSubmit}
                    className="w-full p-2 bg-[#00b8d9] text-white rounded hover:bg-[#009bb3] transition-colors duration-300"
                >
                    Create Group
                </button>
            </div>
        </div>
    );
};

export default CreateGroupComponent;
