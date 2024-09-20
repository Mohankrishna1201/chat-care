import { initializeApp } from "firebase/app";
import { createContext, useContext, useState, useEffect } from "react";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    FacebookAuthProvider,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import {
    getMessaging,
    getToken
} from "firebase/messaging";

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
    const firebaseAuth = getAuth(firebaseApp);

    useEffect(() => {
        onAuthStateChanged(firebaseAuth, (user) => {
            if (user) setUser(user);
            else setUser(null);
        });
    }, []);

    const currentUser = user;

    const UserLogout = async () => {
        await signOut(firebaseAuth);
        setUser(null);
    };

    const UserSignUpwithEmailandPassword = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            await saveUserToFirestore(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    };

    const UserLoginwithEmailandPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            await saveUserToFirestore(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    };

    const UserLoginGoogle = async () => {
        try {
            const userCredential = await signInWithPopup(firebaseAuth, Googleprovider);
            await saveUserToFirestore(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error('Error with Google login:', error);
            throw error;
        }
    };

    const UserLoginFacebook = async () => {
        try {
            const userCredential = await signInWithPopup(firebaseAuth, Facebookprovider);
            await saveUserToFirestore(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error('Error with Facebook login:', error);
            throw error;
        }
    };

    const sendPasswordReset = (email) => {
        return sendPasswordResetEmail(firebaseAuth, email);
    };

    const getUserToken = async () => {
        const permission = await Notification.requestPermission();
        console.log(permission);

        if (permission === 'granted') {
            try {
                const token = await getToken(messaging, {
                    vapidKey: "BPKC7TV7HTzFCj09cvK6k5KZDMFERejrpN9FjOFHdigCQi1EqpHkyGhNoHmtxsqAPtHAtgdteyL0TePRdUPhJMA"
                });
                console.log(token);
                return token;
            } catch (error) {
                console.error('Error getting token:', error);
                return null;
            }
        } else {
            console.warn('Notification permission denied.');
            return null;
        }
    };

    const saveUserToFirestore = async (user) => {
        try {
            const token = await getUserToken();
            const userRef = doc(firestore, `users/${user.uid}`);

            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0], // Use part of email if displayName is not available
                photoURL: user.photoURL || "https://cdn.dribbble.com/userupload/16679327/file/original-488cabe1e6982d3315c6e878b1b6b85f.png?resize=400x400",
                notificationToken: token || null,
                lastLogin: new Date()
            }, { merge: true });

            console.log('User data successfully saved to Firestore');
        } catch (error) {
            console.error('Error saving user data to Firestore:', error);
        }
    };

    const isLoggedIn = user ? true : false;

    let userNotificationStatus = null;

    // Existing functions remain unchanged...

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

    const handleToken = async () => {
        if (!currentUser) {
            console.error('Current user is null. Please register to get a token.');
            return;
        }

        const token = await getUserToken();
        if (!token) {
            console.error('Failed to retrieve token. Token is null or undefined.');
            return;
        }

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
        return token;
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
    };

    const getImageUrl = (path) => {
        return getDownloadURL(ref(storage, path));
    };

    const getUserDetails = async () => {
        if (!currentUser) {
            console.error('Current user is null.');
            return null;
        }

        const token = await getUserToken();

        if (!token) {
            console.error('Failed to retrieve token.');
            return null;
        }
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
        <FirebaseContext.Provider value={{
            UserSignUpwithEmailandPassword,
            UserLoginwithEmailandPassword,
            UserLoginGoogle,
            UserLoginFacebook,
            isLoggedIn,
            UserLogout,
            currentUser,
            getUser,
            getImageUrl,
            getUserToken,
            messaging,
            handleToken,
            getSavedToken,
            getUserDetails,
            sendPasswordReset,
            userNotificationStatus,
            getAllUsers
        }}>
            {children}
        </FirebaseContext.Provider>
    );
};
