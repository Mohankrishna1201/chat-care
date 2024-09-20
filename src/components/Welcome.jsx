import React from 'react'

const Welcome = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0d0d0d] text-white p-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 text-[#00b8d9]">Welcome to Chat Care</h1>
                <p className="text-lg text-gray-300 mb-8">
                    Start a conversation or create a new channel to begin chatting.
                </p>
            </div>

            <div className="w-full max-w-lg">

            </div>

            <div className="mt-8">
                <p className="text-sm text-gray-500">Connect with your friends and colleagues seamlessly.</p>
            </div>
        </div>
    );
};

export default Welcome;