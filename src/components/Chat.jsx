import React, { useEffect, useState } from 'react';
import {
    Chat,
    Channel,
    ChannelHeader,
    ChannelList,
    MessageInput,
    MessageList,
    Thread,
    Window
} from 'stream-chat-react';
import { IoArrowBack } from 'react-icons/io5';
import 'stream-chat-react/dist/css/v2/index.css';
import '../App.css';
import { useStreamChat } from '../context/stream';
import { useFirebase } from '../context/firebase';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import CreateChannelComponent from './CreateChannelComponent';
import CreateGroupComponent from './CreateGroupComponent';
import { FaUsers } from 'react-icons/fa';
import { MdVideocam } from 'react-icons/md';

const ChatComponent = () => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);  // Default is loading until everything is ready
    const [error, setError] = useState(null);
    const [activeChannel, setActiveChannel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const client = useStreamChat();
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!firebase.isLoggedIn) {
            navigate('/login');
        }
    }, [firebase, navigate]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true); // Start loading before fetching users
            try {
                const usersList = await firebase.getAllUsers();
                const filteredUsers = usersList.filter(user => user.uid !== firebase.currentUser?.uid);
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false); // End loading once users are fetched
            }
        };

        fetchUsers();
    }, [firebase]);

    const fetchToken = async (userId) => {
        setLoading(true); // Start loading before fetching token
        try {
            const response = await fetch('https://chat-backend-2c4u.onrender.com/get-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token');
            }

            const data = await response.json();
            setToken(data.token);
        } catch (err) {
            console.error('Error fetching token:', err);
            setError('Error fetching token');
        } finally {
            setLoading(false); // End loading once token is fetched
        }
    };

    useEffect(() => {
        const initializeChat = async () => {
            setLoading(true);  // Start loading before initializing chat
            try {
                const userDetails = await firebase.getUserDetails();
                if (!userDetails) {
                    throw new Error('User not logged in');
                }
                await fetchToken(userDetails.userID);
            } catch (err) {
                console.error('Error initializing chat:', err);
                setError('Error initializing chat');
            } finally {
                setLoading(false);  // End loading once chat is initialized
            }
        };

        if (firebase.isLoggedIn) {
            initializeChat();
        }
    }, [firebase]);

    useEffect(() => {
        if (!token || !firebase.currentUser) return;

        const connectUser = async () => {
            setLoading(true);  // Start loading before connecting user
            try {
                await client.connectUser(
                    {
                        id: firebase.currentUser.uid,
                        name: firebase.currentUser.displayName,
                        image: firebase.currentUser.photoURL,
                    },
                    token
                );
            } catch (err) {
                console.error('Error connecting user:', err);
                setError('Error connecting user');
            } finally {
                setLoading(false);  // End loading once user is connected
            }
        };

        connectUser();

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [token, firebase.currentUser, client]);

    const handleChannelSelect = async (selectedChannel) => {
        if (activeChannel?.id === selectedChannel.id) return; // Prevent re-setting the same channel
        setActiveChannel(selectedChannel);
    };
    const handleVideoNavigate = () => {
        navigate('/video');
    }
    const handleUserClick = async (selectedUserId) => {
        if (!client || !firebase.currentUser) return;

        setLoading(true);  // Start loading before creating a channel
        const channel = client.channel('messaging', {
            members: [firebase.currentUser.uid, selectedUserId],
        });

        await channel.watch(); // Ensure the channel is watched instead of creating it multiple times
        handleChannelSelect(channel);  // End loading once channel is selected
        setLoading(false);
    };

    const handleGroupCreate = async (groupName, selectedUsers) => {
        if (!client || !firebase.currentUser) return;

        setLoading(true);  // Start loading before creating a group
        const channel = client.channel('messaging', {
            name: groupName,
            members: [firebase.currentUser.uid, ...selectedUsers],
        });

        await channel.create();
        handleChannelSelect(channel);  // End loading once group is created
        setIsGroupModalOpen(false);
        setLoading(false);
    };

    if (loading) return (<Loader />);  // Show loader when any async action is in progress
    if (error) return <div>{error}</div>;

    const filters = { type: 'messaging', members: { $in: [firebase.currentUser?.uid] } };
    const sort = { last_message_at: -1 };
    const filteredUsers = users.filter((user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Chat theme="str-chat__theme-dark" client={client}>
                <div className="flex h-screen bg-gray-900">
                    {isSidebarOpen && (
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 lg:hidden z-40"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <div className="relative bottom-0 left-0 w-3/4 bg-[#17191c]  h-full shadow-lg">
                                <ChannelList filters={filters} sort={sort} />
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-4 w-full h-full">
                        {/* Sidebar (Hidden on mobile) */}
                        <div className="hidden lg:block col-span-1 bg-[#17191c]  h-full">
                            <div className="sticky-container h-screen flex flex-col">
                                {/* Create Group Section */}
                                <div className="sticky top-0 p-4 bg-[#17191c]  shadow-lg z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h1 className="text-lg font-semibold text-white">Create a Group</h1>
                                        <button
                                            onClick={() => setIsGroupModalOpen(true)} // Open modal on button click
                                            className="p-2 bg-[#00b8d9] text-white rounded-full hover:bg-[#009ec3] transition-all duration-200 ease-in-out"
                                        >
                                            <FaUsers size={20} />
                                        </button>

                                    </div>

                                    <CreateChannelComponent
                                        users={filteredUsers}
                                        handleUserClick={handleUserClick}
                                    />
                                </div>

                                {/* Channel List */}
                                <div className="flex-grow overflow-y-auto p-4">
                                    <ChannelList filters={filters} sort={sort} />
                                </div>
                            </div>
                        </div>

                        {/* Main Chat Window */}
                        <div className="col-span-3 bg-black flex flex-col h-full">
                            <Channel emojiPicker={null}>
                                <Window>
                                    <div className="flex items-center justify-between gap-10 p-2 bg-[#17191c] border-b border-gray-700 lg:hidden">
                                        {/* Left Icon and Channel Header combined */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setIsSidebarOpen(true)} className="p-2">
                                                <IoArrowBack size={24} className="text-white" />
                                            </button>
                                            <ChannelHeader />
                                        </div>

                                        {/* Video Icon with circular style and right margin */}
                                        <button onClick={handleVideoNavigate} className="p-2 rounded-full bg-[#00b8d9] hover:bg-[#009bb3] mr-4">
                                            <MdVideocam size={24} className="text-white" />
                                        </button>
                                    </div>



                                    <div className="hidden lg:flex items-center justify-between bg-[#17191c] p-2 border-b border-gray-700">

                                        <ChannelHeader />


                                        <button className="p-2 rounded-full bg-[#00b8d9] hover:bg-[#009bb3] mr-4">
                                            <MdVideocam size={24} className="text-white" />
                                        </button>
                                    </div>


                                    {/* Messages */}
                                    <div className="flex-grow overflow-y-auto p-4 bg-black">
                                        <MessageList />
                                    </div>

                                    {/* Message Input */}
                                    <div className="sticky bottom-0">
                                        <MessageInput />
                                    </div>
                                </Window>
                                <Thread />
                            </Channel>
                        </div>
                    </div>
                </div>
            </Chat>


            {isGroupModalOpen && (
                <CreateGroupComponent
                    users={users}
                    handleGroupCreate={handleGroupCreate}
                    onClose={() => setIsGroupModalOpen(false)}  // Close modal when clicked
                />
            )}
        </>
    );
};

export default ChatComponent;
