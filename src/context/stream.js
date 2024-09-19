// src/context/StreamChatContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';

// Create context
const StreamChatContext = createContext(null);

export const StreamChatProvider = ({ children }) => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                // Initialize StreamChat client
                const chatClient = StreamChat.getInstance('kuuuk3c7qeym');
                setClient(chatClient);
            } catch (err) {
                setError('Failed to initialize chat client');
                console.error('Error initializing StreamChat:', err);
            } finally {
                setLoading(false);
            }
        };

        initChat();

        return () => {
            client?.disconnectUser();
        };
    }, []);

    if (loading) return <div>Loading Chat...</div>;
    if (error) return <div>{error}</div>;

    return (
        <StreamChatContext.Provider value={client}>
            {children}
        </StreamChatContext.Provider>
    );
};

export const useStreamChat = () => {
    const context = useContext(StreamChatContext);
    if (!context) {
        throw new Error('useStreamChat must be used within a StreamChatProvider');
    }
    return context;
};
