import React, { useState, useRef, useEffect, useContext, createRef } from 'react';
import { AuthContext } from '../AuthProvider';
import { useParams } from 'react-router-dom';
import Peer from 'simple-peer';

import CallEndIcon from '../assets/icons/call_end-24px.svg';
import MButton from '../components/MButton';
import RoomErrorBoundary from '../components/RoomErrorBoundary';

import styled from 'styled-components';

import * as firebase from 'firebase/app';

import VideoContainerSample from '../components/VideoContainerSample'
import 'firebase/database';

const Video = styled.video`
	width: 100%;
	background-color: #333;
	-webkit-transform: scaleX(-1);
	transform: scaleX(-1);
`;



const RoomContainer = styled.div`
	display:flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100vh;
`;

const ButtonArea = styled.div`
	padding: 1rem 0;
	display: flex;
    flex-direction: column;
	align-items: center;
	flex: 0 0 448px;
    height: 540px;
    justify-content: center;
    margin: 16px 16px 16px 8px;
    position: relative;
`;


function RoomPage(props) {
	const { user } = useContext(AuthContext); // Get auth user
	const { roomId } = useParams(); // Get Room ID
	const videoRef = createRef();

	const db = firebase.database();

	const [videoStream, setVideoStream] = useState(null);
	const [peers, setPeers] = useState([]);
	const peersRef = useRef([]);

	const [hasCamera, setCamera] = useState(false);
	const [userInLobby, setUserInLobby] = useState(true);

	var isOfflineForDatabase = {
		data: {
			state: 'offline',
			last_changed: firebase.database.ServerValue.TIMESTAMP
		}
	};

	var isOnlineForDatabase = {
		data: {
			state: 'online',
			last_changed: firebase.database.ServerValue.TIMESTAMP
		}
	};

	async function getDevices() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices()
			return typeof devices.find((device) => device.kind === "videoinput") === "undefined";
		} catch (err) {
			console.log(err.name + ": " + err.message);
			return [];
		}
	}

	// useEffect(() => {

	// 	// (async ()=>{
	// 	// 	const hasCamera = await getDevices();

	// 	// })();	


	// 	let mediaConstrains = {
	// 		video: false,
	// 		audio: true,
	// 	}

	// 	navigator.mediaDevices.enumerateDevices()
	// 		.then(function (devices) {
	// 			devices.forEach(function (device) {
	// 				console.log(device.kind + ": " + device.label +
	// 					" id = " + device.groupId);

	// 				if(device.kind === "videoinput") {
	// 					setCamera(true);
	// 				}
	// 			});
	// 		})
	// 		.catch(function (err) {
	// 			console.log(err.name + ": " + err.message);
	// 		});

	// 	navigator.mediaDevices
	// 		.getUserMedia(mediaConstrains)
	// 		.then((stream) => {
	// 			setVideoStream(stream);

	// 		//Joining room
	// 		const userStatusDatabaseRef = db.ref('rooms/' + roomId + '/members/' + user.uid);
	// 		// userStatusDatabaseRef.push().set(isOnlineForDatabase);
	// 		userStatusDatabaseRef.set(isOnlineForDatabase);
	// 		userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
	// 			// The promise returned from .onDisconnect().set() will
	// 			// resolve as soon as the server acknowledges the onDisconnect()
	// 			// request, NOT once we've actually disconnected:
	// 			// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

	// 			// We can now safely set ourselves as 'online' knowing that the
	// 			// server will mark us as offline once we lose connection.
	// 			// db.ref('rooms/' + roomId + '/signals/'+user.uid).remove();
	// 			userStatusDatabaseRef.set(isOnlineForDatabase);
	// 		});



	// 		//Get All members
	// 		const membersRef = db.ref('rooms/' + roomId + '/members/');
	// 		membersRef.once('value', function (snapshot) {
	// 			const peers = [];
	// 			const memberIds = Object.keys(snapshot.val());
	// 			memberIds.filter(id => id !== user.uid && snapshot.val()[id].data.state !== "offline").forEach(memberId => {
	// 				const peer = createPeer(memberId, user.uid, stream);
	// 				peersRef.current.push({
	// 					peerID: memberId,
	// 					peer,
	// 				})
	// 				peers.push(peer);
	// 			})
	// 			setPeers(peers);
	// 			console.log("Peers", peersRef.current)
	// 		});



	// 		//listen for joining users
	// 		const signalsRef = db.ref('rooms/' + roomId + '/signals/' + user.uid + '/sent');
	// 		signalsRef.on('child_added', function (data) {
	// 			const { signal, callerId, userToSignal } = data.val();
	// 			const peer = addPeer(signal, callerId, userToSignal, stream);

	// 			const alReadyExists = typeof peersRef.current.find(({ peerID }) => peerID === callerId) !== "undefined";

	// 			if (!alReadyExists) {
	// 				peersRef.current.push({
	// 					peerID: callerId,
	// 					peer,
	// 				})

	// 				setPeers(users => [...users, peer]);
	// 			}
	// 			const l = peersRef.current.length;
	// 			console.log("Lister for join Peers", l)
	// 		});


	// 		const retSignalsRef = db.ref('rooms/' + roomId + '/signals/' + user.uid + '/toAccept');
	// 		retSignalsRef.on('child_added', function (data) {
	// 			console.log(data.val());
	// 			const { signal, signaledUser } = data.val();
	// 			if (signal.sdp) {
	// 				console.log("CUrent refs", peersRef.current);
	// 				const item = peersRef.current.find(p => p.peerID === signaledUser);
	// 				console.log(item);
	// 				if (item)
	// 					item.peer.signal(signal);
	// 			}
	// 		})

	// });
	// }, []);

	function createPeer(userToSignal, callerId, stream) {
		console.log(`Creating peer from ${callerId} to  ${userToSignal}`)
		const peer = new Peer({
			initiator: true, // tell everyone else that im joining room
			trickle: false,
			stream: stream
		})

		peer.on('signal', (signal) => {
			const userStatusDatabaseRef = db.ref('rooms/' + roomId + '/signals/' + userToSignal + '/sent');
			const newRef = userStatusDatabaseRef.push();
			newRef.set({
				userToSignal,
				callerId,
				signal,
			});
		})

		return peer;
	}

	function addPeer(incomingSignal, callerId, signaledUser, stream) {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream
		})
		peer.on('signal', (signal) => {

			const userStatusDatabaseRef = db.ref('rooms/' + roomId + '/signals/' + callerId + '/toAccept');
			const newRef = userStatusDatabaseRef.push();
			newRef.set({
				signal,
				signaledUser,
			})

		})

		peer.signal(incomingSignal);

		return peer;
	}

	function onPeerDisconnect(allPeers, disconnectedPeerID, discPeer) {
		db.ref('rooms/' + roomId + '/signals/' + user.uid).remove();
		console.log("onPeerDisconnect");
		const alReadyExists = peersRef.current.find(({ peerID }) => peerID === disconnectedPeerID);
		peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== disconnectedPeerID)
		console.log("NEW members", peersRef.current);
		console.log(alReadyExists, disconnectedPeerID, peersRef.current);

		setPeers([]); // this removes all TODO: it's wrong pls fix NOW

		if (alReadyExists) {
			console.log("Disconnected:", alReadyExists.peerID);
			discPeer.destroy();
			setPeers([])
		}
	}



	// useEffect(async() => {
	// 	var isOfflineForDatabase = {
	// 		data: {
	// 			state: 'offline',
	// 			last_changed: firebase.database.ServerValue.TIMESTAMP
	// 		}
	// 	};

	// 	var isOnlineForDatabase = {
	// 		data: {
	// 			state: 'online',
	// 			last_changed: firebase.database.ServerValue.TIMESTAMP
	// 		}
	// 	};
	//     const hostRef = db.ref('rooms/' + roomId + '/host/');
	//     const res = await hostRef.once('value');
	//     const hostId = Object.keys(res.val())[0];
	//     if(hostId === user.uid) {
	//         const peer = new Peer({initiator: true});

	//     }else {

	//     }

	//     const userStatusDatabaseRef = db.ref('rooms/' + roomId + '/members/' + user.uid);
	// 	userStatusDatabaseRef.push().set(isOnlineForDatabase);
	// 	var starCountRef = db.ref('rooms/' + roomId);

	// 	starCountRef.on('value', function(snapshot) {
	// 		const members = snapshot.val().members;
	// 		console.log(members);
	// 		setRoomData(snapshot.val());
	// 	});

	// 	starCountRef.child('members').on('child_added', ({ key: memName }) => {
	//         console.log('CHILD ADDED', memName);

	// 		// peer.on('data', (data) => {
	// 		//     console.log("GOT DATA", data);
	// 		// })

	// 		// peer.on('close',()=>{
	// 		//     memberRef.remove();
	// 		//     memberRef.off('child_added');

	// 		//     signalDataRef.remove();

	// 		//     // peer.destroy();
	// 		// })
	// 	});

	// 	// userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
	// 	// 	// The promise returned from .onDisconnect().set() will
	// 	// 	// resolve as soon as the server acknowledges the onDisconnect()
	// 	// 	// request, NOT once we've actually disconnected:
	// 	// 	// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

	// 	// 	// We can now safely set ourselves as 'online' knowing that the
	// 	// 	// server will mark us as offline once we lose connection.
	// 	// 	userStatusDatabaseRef.set(isOnlineForDatabase);
	// 	// });

	// 	return async () => {
	// 		starCountRef.off();
	// 		userStatusDatabaseRef.set(isOfflineForDatabase);
	// 		userStatusDatabaseRef.off();
	// 	};
	// }, []);

	// useEffect(() => {
	// 	// navigator.mediaDevices.enumerateDevices().then(console.log)
	// 	navigator.mediaDevices
	// 		.getUserMedia({
	// 			video: true,
	// 			audio: true
	// 		})
	// 		.then((stream) => {
	// 			setVideoStream(stream);
	// 		});
	// }, []);

	// useEffect(
	// 	() => {
	// 		videoRef.current.srcObject = videoStream;
	// 	},
	// 	[videoStream]
	// );

	useEffect(
		() => {
			console.log("UPDATED peers", peers);
			console.log("and peersRef", peersRef.current.slice(0));
		},
		[peers]
	);

	const handleCanPlay = () => {
		videoRef.current.play();
	};

	const PeerVideo = ({ peer, allPeers, onDisconnect, peerID }) => {
		const ref = useRef();
		useEffect(() => {
			peer.on('stream', (stream) => {
				ref.current.srcObject = stream;
			});

			peer.on('close', () => {
				onDisconnect(allPeers, peerID, peer)
				console.log('CLOSING');
			})

			peer.on('error', (err) => {
				// onDisconnect(allPeers,peerID,peer)
				console.log('ERROR', err);
			})
		}, []);

		return <Video playsInline autoPlay ref={ref} />;
	};

	const joinUser = () => {

	}

	return (
		<RoomErrorBoundary {...props}>
			<RoomContainer>

				<VideoContainerSample style={{
					margin:'1rem'
				}}></VideoContainerSample>


				{/* <Video ref={videoRef} onCanPlay={handleCanPlay} autoPlay muted /> */}


				{/* {peers.map((peer, index) => {
						return <PeerVideo key={index} peer={peer} peerID={peersRef.current[index].peerID} onDisconnect={onPeerDisconnect} allPeers={peersRef.current} />;
					})} */}

				<ButtonArea style={{
					margin:'1rem'
				}}>

					<h1>Ready to join?</h1>

					{!userInLobby ?
						<div>
							<img height="30px" src={CallEndIcon}></img>
						</div>

						:
						<MButton color="primary" onClick={joinUser}>Join</MButton>}

				</ButtonArea>

			</RoomContainer>
		</RoomErrorBoundary>
	);
}

export default RoomPage;
