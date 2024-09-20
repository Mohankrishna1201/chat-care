


import { initializeApp } from "firebase/app";
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, } from 'firebase/auth'
import { FacebookAuthProvider, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken } from "firebase/messaging";

import { sendPasswordResetEmail } from "firebase/auth";
const FirebaseContext = createContext(null);

const firebaseConfig = {
    apiKey: "AIzaSyC6-MgewzZHUGEDqqZSQP2qZakU3gq8-z4",
    authDomain: "chat-app-fb511.firebaseapp.com",
    projectId: "chat-app-fb511",
    storageBucket: "chat-app-fb511.appspot.com",
    messagingSenderId: "515552768870",
    appId: "1:515552768870:web:a0bc59a82862ec2a3e8ea7",
    measurementId: "G-C2QGW19RYN"
};

const Googleprovider = new GoogleAuthProvider();
const Facebookprovider = new FacebookAuthProvider();

export const useFirebase = () => {
    return useContext(FirebaseContext);
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const messaging = getMessaging(firebaseApp);
export const FirebaseProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const firebaseAuth = getAuth(firebaseApp)
    useEffect(() => {
        onAuthStateChanged(firebaseAuth, (user) => {
            if (user) setUser(user);
            else setUser(null);
            // console.log(user);
        })
    }, []);
    const currentUser = user;
    const UserLogout = async () => {
        await signOut(firebaseAuth);
        setUser(null);
    };
    const UserSignUpwithEmailandPassword = (email, password) => {
        return createUserWithEmailAndPassword(firebaseAuth, email, password);
    };

    const UserLoginwithEmailandPassword = (email, password) => {
        return signInWithEmailAndPassword(firebaseAuth, email, password);
    };

    const UserLoginGoogle = () => {
        return signInWithPopup(firebaseAuth, Googleprovider);

    }
    const sendPasswordReset = (email) => {
        return sendPasswordResetEmail(firebaseAuth, email);
    };
    const UserLoginFacebook = () => {
        return signInWithPopup(firebaseAuth, Facebookprovider);

    }
    const isLoggedIn = user ? true : false;


    let userNotificationStatus = null;
    // Import necessary Firestore methods

    const getAllUsers = async () => {
        try {
            const usersCollection = collection(firestore, 'users'); // Correct usage
            const snapshot = await getDocs(usersCollection);
            return snapshot.docs.map((doc) => doc.data());
        } catch (error) {
            console.error("Error fetching users: ", error);
            return [];
        }
    };


    const getUserToken = async () => {
        const permission = await Notification.requestPermission();
        console.log(permission);

        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: "BPKC7TV7HTzFCj09cvK6k5KZDMFERejrpN9FjOFHdigCQi1EqpHkyGhNoHmtxsqAPtHAtgdteyL0TePRdUPhJMA"
            });
            console.log(token);

            if (token) {
                return token;
            }
        } else {
            userNotificationStatus = 'denied'; // Set variable value if permission is not granted
        }
    };

    const handleToken = async () => {
        if (!currentUser) {
            console.error('Current user is null. Please register to get a token.');
            return;
        }

        // Try to get the notification token, but don't block the chat connection if it fails
        const token = await getUserToken();
        if (token) {
            const userTokenDocRef = doc(firestore, `tokens/${currentUser.uid}`);
            try {
                await setDoc(userTokenDocRef, {
                    userToken: token,
                    userID: currentUser.uid,
                }, { merge: true });
                console.log('Token successfully saved for the user.', token);
            } catch (error) {
                console.error('Error saving token:', error);
            }
        } else {
            console.warn('Skipping token save as notifications are not granted.');
        }
    };

    const DataOfUserTokens = [];

    const getSavedToken = async () => {
        try {
            const userTokens = await getDocs(collection(firestore, `tokens`));
            const BigParent = userTokens.docs;

            for (let snapshot of BigParent) {
                // Extract data from QueryDocumentSnapshot objects
                const token = snapshot.data();

                // Check if the token already exists in DataOfUserTokens
                const exists = DataOfUserTokens.some(
                    item => item.savedToken === token.userToken && item.savedUserID === token.userID
                );

                if (!exists) {
                    DataOfUserTokens.push({
                        savedToken: token.userToken,
                        savedUserID: token.userID
                    });
                }
            }

            console.log('here!');
            // console.log(DataOfUserTokens);
        } catch (error) {
            console.error("Error getting tokens: ", error);
        }
    };



    const getUser = () => {

        return getDocs(collection(firestore, 'users'));
    }

    const getImageUrl = (path) => {
        return getDownloadURL(ref(storage, path));
    }



    const getUserDetails = async () => {
        if (!currentUser) {
            console.error('Current user is null.');
            return null;
        }
        const token = await getUserToken();
        console.log('check here', token, currentUser.email)
        return {
            name: currentUser.displayName
                ? currentUser.displayName
                : currentUser.email.substring(0, 8), // Use first 8 characters of email if displayName is not available
            userID: currentUser.uid,
            userToken: token,
            userEmail: currentUser.email,
            userImg: currentUser.photoURL
                ? currentUser.photoURL
                : "https://cdn.dribbble.com/userupload/16679327/file/original-488cabe1e6982d3315c6e878b1b6b85f.png?resize=400x400", // Provide a default image if photoURL is not available
        };

    };

    return (
        <FirebaseContext.Provider value={{ UserSignUpwithEmailandPassword, UserLoginwithEmailandPassword, UserLoginGoogle, UserLoginFacebook, isLoggedIn, UserLogout, currentUser, getUser, getImageUrl, getUserToken, messaging, handleToken, getSavedToken, getUserDetails, sendPasswordReset, userNotificationStatus, getAllUsers }}>
            {children}
        </FirebaseContext.Provider>
    );
};