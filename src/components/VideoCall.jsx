import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useRef, useState } from 'react';
import { useFirebase } from '../context/firebase';
function randomID(len) {
    let result = '';
    if (result) return result;
    var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
        maxPos = chars.length,
        i;
    len = len || 5;
    for (i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
}

export function getUrlParams(url = window.location.href) {
    let urlStr = url.split('?')[1];
    return new URLSearchParams(urlStr);
}

export default function VideoCallPage() {
    const firebase = useFirebase();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const getUser = async () => {
        setLoading(true);
        try {
            const result = await firebase.getUserDetails();
            setUser(result);
        } catch (err) {

            console.error('Error fetching user details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const roomID = getUrlParams().get('roomID') || randomID(5);
    const containerRef = useRef(null);

    useEffect(() => {
        let zp;

        const myMeeting = async () => {

            const appID = 831966426;
            const serverSecret = '3755242541dc6323fe28dc0554aff489';
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));


            zp = ZegoUIKitPrebuilt.create(kitToken);


            zp.joinRoom({
                container: containerRef.current,
                sharedLinks: [
                    {
                        name: 'Personal link',
                        url:
                            window.location.protocol +
                            '//' +
                            window.location.host +
                            window.location.pathname +
                            '?roomID=' +
                            roomID,
                    },
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.GroupCall,
                },
            });
        };


        myMeeting();


        return () => {
            if (zp) {
                zp.destroy();
            }
        };
    }, [roomID]);

    return (
        <div
            className="myCallContainer flex items-center justify-center"
            ref={containerRef}
            style={{ width: '100vw', height: '100vh' }}
        ></div>
    );
}
