import React, { useEffect } from 'react'
import { StreamChat } from 'stream-chat'
import { Chat } from 'stream-chat-react'

import ChannelListContainer from './components/ChannelListContainer'
import { Route, Routes } from 'react-router-dom'
import "./App.css"
import SignUp from './components/SignUp'
import Login from './components/Login'
import { useFirebase } from './context/firebase';
import { StreamChatProvider } from './context/stream'
import ChatComponent from './components/Chat'
import CreateChannelComponent from './components/CreateChannelComponent'
import NavbarComponent from './components/NavBarComponent'
import VideoCall from './components/VideoCall'

const apiKey = "kuuuk3c7qeym"
const client = StreamChat.getInstance(apiKey);

export default function App() {
  const firebase = useFirebase()
  useEffect(() => {

    firebase.getUserToken()
  }, [])

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registration successful with scope: ', registration.scope);
      }).catch((err) => {
        console.log('Service Worker registration failed: ', err);
      });
  }

  return (
    <div className="app_wrapper">
      <NavbarComponent />
      <StreamChatProvider>

        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/main" element={<ChatComponent />} />
          <Route path="/check" element={<ChannelListContainer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-channel" element={<CreateChannelComponent />} />
          <Route path="/video" element={<VideoCall />} />

        </Routes>
      </StreamChatProvider>

    </div>
  )
}
