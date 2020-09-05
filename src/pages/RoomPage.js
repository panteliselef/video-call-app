import React, { useState, useEffect, useContext, createRef } from 'react';
import { AuthContext } from '../AuthProvider';
import { useParams } from "react-router-dom";
import * as firebase from "firebase/app";
import "firebase/database";



function RoomPage() {
    const { roomId } = useParams();
    const [roomData, setRoomData] = useState({})
    const [owner, setOwner] = useState('');
    const { user } = useContext(AuthContext);
    const videoRef = createRef();
    const db = firebase.database();
    useEffect(() => {
        var isOfflineForDatabase = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };
        
        var isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };
        const userStatusDatabaseRef = db.ref('rooms/' + roomId+'/connectedMembers/'+user.uid);
        userStatusDatabaseRef.set(isOnlineForDatabase);
        var starCountRef = db.ref('rooms/' + roomId);
        starCountRef.on('value', function(snapshot) {
            setRoomData(snapshot.val());
        });


        userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
            // The promise returned from .onDisconnect().set() will
            // resolve as soon as the server acknowledges the onDisconnect() 
            // request, NOT once we've actually disconnected:
            // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
    
            // We can now safely set ourselves as 'online' knowing that the
            // server will mark us as offline once we lose connection.
            userStatusDatabaseRef.set(isOnlineForDatabase);
        });



        // const unsubscribe = db.collection("rooms").doc(roomId)
        //     .onSnapshot(function (doc) {
        //         if (doc.exists) {
        //             setRoomData(doc.data());
        //             getUserById(doc.data().ownerId);
        //             console.log("Document data:", doc.data());
        //         } else {
        //             console.log("No such document!");
        //         }
        //     });


        // window.onbeforeunload = async function (e) {
        //     e.returnValue = `Are you sure you want to leave?`;
        //     await db.collection("rooms").doc(roomId).update({
        //         connectedMembers: firebase.firestore.FieldValue.arrayRemove(user.uid)
        //     });
        // }

        // docRef.get().then(function (doc) {
        //     db.collection("rooms").doc(roomId).update({
        //         connectedMembers: firebase.firestore.FieldValue.arrayUnion(user.uid)
        //     });
        // }).catch(function (error) {
        //     console.log("Error getting document:", error);
        // });

        return async() => {
            // unsubscribe();
            starCountRef.off();
            userStatusDatabaseRef.set(isOfflineForDatabase);
            userStatusDatabaseRef.off();

        }



    }, [])
    const [videoStream,setVideoStream] = useState({});

    useEffect(()=>{
        navigator.mediaDevices.enumerateDevices().then(console.log)
        // console.log()
        // navigator.mediaDevices.getUserMedia({
        //     video: true,
        //     audio:true,
        // }).then(stream => {
        //     console.log(stream);
        //     setVideoStream(stream);
        // })
    },[])


    // useEffect(()=> {
    //     videoRef.current.srcObject = videoStream;
    // },[videoStream])



    const getUserById = (uid) => {
        const docRef = db.collection("users").doc(uid);
        docRef.get().then(function (doc) {
            if (doc.exists) {
                setOwner(doc.data().email);
                console.log("Document data:", doc.data());
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }



    return (
        <div>
            <h1>{roomId}</h1>
            <p>Owner: {owner}</p>
            <ul>
                {roomData.connectedMembers && Object.keys(roomData.connectedMembers).filter(member=>roomData.connectedMembers[member].state==="online").map(member => <li key={member}>{member}</li>)}
            </ul>


            <video ref={videoRef}>

            </video>

        </div>
    )
}


export default RoomPage;