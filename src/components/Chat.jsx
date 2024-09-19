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
import { EmojiPicker } from 'stream-chat-react/emojis';

import { init, SearchIndex } from 'emoji-mart';
import 'stream-chat-react/dist/css/v2/index.css';
import "../App.css"
import { useStreamChat } from '../context/stream'; // StreamChat instance from context
import { useFirebase } from '../context/firebase'; // Firebase instance to get user data
import CreateChannelComponent from './CreateChannelComponent'; // Component to list users and create channels
import { useNavigate } from 'react-router-dom';

const ChatComponent = () => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChannel, setActiveChannel] = useState(null); // Holds the currently active channel
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const client = useStreamChat(); // StreamChat instance from context
    const firebase = useFirebase(); // Firebase instance to get user data
    const navigate = useNavigate();

    useEffect(() => {
        // Ensure user is logged in, if not redirect to login page
        if (!firebase.isLoggedIn) {
            navigate('/login');
        }
    }, [firebase, navigate]);

    const fetchToken = async (userId) => {
        try {
            const response = await fetch('http://localhost:3001/get-token', {
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
        }
    };

    // Fetch user details and token, and connect to Stream chat client
    useEffect(() => {
        const initializeChat = async () => {
            try {
                setLoading(true);

                // Get user details from Firebase
                const userDetails = await firebase.getUserDetails();

                if (!userDetails) {
                    throw new Error('User not logged in');
                }

                // Fetch Stream chat token for the user
                await fetchToken(userDetails.userID);
            } catch (err) {
                console.error('Error initializing chat:', err);
                setError('Error initializing chat');
            } finally {
                setLoading(false);
            }
        };

        if (firebase.isLoggedIn) {
            initializeChat();
        }
    }, [firebase]);

    // Connect the user to Stream Chat once token and user details are available
    useEffect(() => {
        if (!token || !firebase.currentUser) return;

        const connectUser = async () => {
            try {
                await client.connectUser(
                    {
                        id: firebase.currentUser.uid,
                        name: firebase.currentUser.displayName,
                        image: firebase.currentUser.photoURL, // Assuming Firebase gives user profile image
                    },
                    token
                );
            } catch (err) {
                console.error('Error connecting user:', err);
                setError('Error connecting user');
            }
        };

        connectUser();

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [token, firebase.currentUser, client]);

    // Handle channel selection from the ChannelList
    const handleChannelSelect = (channel) => {
        setActiveChannel(channel); // Set the selected channel as the active channel
    };

    // Function to create a direct message channel
    const handleUserClick = async (selectedUserId) => {
        if (!client || !firebase.currentUser) return;

        const channel = client.channel('messaging', {
            members: [firebase.currentUser.uid, selectedUserId],
        });

        await channel.create();
        setActiveChannel(channel); // Set the active channel after creation
        setIsModalOpen(false); // Close modal after channel creation
    };

    if (loading) return <div>Loading Chat...</div>;
    if (error) return <div>{error}</div>;

    const filters = { type: 'messaging', members: { $in: [firebase.currentUser?.uid] } };
    const sort = { last_message_at: -1 };

    return (
        <>
            <Chat theme='str-chat__theme-dark' client={client}>
                <div className="flex h-screen bg-[#0d0d0d]">
                    {/* Sidebar for mobile */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-[#0d0d0d] bg-opacity-75 transition-opacity lg:hidden z-40"
                            onClick={() => setIsSidebarOpen(false)} // Clicking outside will close sidebar
                        >
                            <div
                                className="absolute top-0 left-0 w-3/4 bg-[#0d0d0d] h-full shadow-lg p-4"
                                onClick={(e) => e.stopPropagation()} // Prevent click inside sidebar from closing
                            >
                                <ChannelList filters={filters} sort={sort} />
                            </div>
                        </div>
                    )}

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 w-full">
                        {/* Left panel (1/4) for large screens */}
                        <div className="hidden lg:block col-span-1 bg-[#0d0d0d] p-4">
                            <ChannelList filters={filters} sort={sort} />
                        </div>

                        {/* Right panel (3/4) */}
                        <div className="col-span-3 bg-[#0d0d0d] p-4">

                            <Channel emojiPicker={EmojiPicker} emojiSearchIndex={SearchIndex}>
                                <Window>
                                    <div className='flex row-span-1'>
                                        <button
                                            className="lg:hidden p-2 bg-blue-500 text-white"
                                            onClick={() => setIsSidebarOpen(true)} // Open sidebar button for mobile
                                        >
                                            O
                                        </button>
                                        <ChannelHeader />
                                    </div>

                                    <MessageList />
                                    <MessageInput />
                                </Window>
                                <Thread />
                            </Channel>
                        </div>
                    </div>
                </div>
            </Chat>
            <div className="mt-4">
                <button
                    className="p-2 bg-green-500 text-white rounded"
                    onClick={() => setIsModalOpen(true)} // Open modal on button click
                >
                    Start a New Conversation
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-2xl mb-4">Create a New Channel</h2>
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>
                        <CreateChannelComponent handleUserClick={handleUserClick} /> {/* Pass handleUserClick */}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatComponent;
