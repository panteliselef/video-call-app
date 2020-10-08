import React, { useState, useRef, useEffect, useContext, createRef } from 'react';
import { AuthContext } from '../AuthProvider';
import { useParams } from 'react-router-dom';
import Peer from 'simple-peer';

import CallEndIcon from '../assets/icons/call_end-24px.svg';
import { mdiMicrophone, mdiCamera, mdiCameraOff, mdiPhoneHangup, mdiMicrophoneOff } from '@mdi/js';
import MButton from '../components/MButton';
import MIconButton from '../components/MIconButton';
import RoomErrorBoundary from '../components/RoomErrorBoundary';
import ToggleIconButton from '../components/ToggleIconButton';

import { useListVals } from 'react-firebase-hooks/database';

import styled from 'styled-components';

import * as firebase from 'firebase/app';

import StreamTile from '../components/StreamTile';
import VideoContainerSample from '../components/VideoContainerSample';
import 'firebase/database';

const FlexVideoContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	${'' /* height: 100vh; */} max-width: 1440px;
	flex-wrap: wrap;
`;

const FlexVideoItem = styled.div`
	flex: 0 1 calc(50% - 1rem);
	height: ${(props) => {
		const p = 100 / props.rows;
		return `calc(${p} - 1rem)`;
	}};
	margin: .5rem;
	border-radius: 0.5rem;
	overflow: hidden;
`;
const RoomContainer = styled.div`
	display: flex;
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
const BottomArea = styled.div`
	width: 100%;
	position: absolute;
	padding: 1rem 0;
	background-image: -webkit-linear-gradient(
		bottom,
		rgba(0, 0, 0, 0.7) 0,
		rgba(0, 0, 0, 0.3) 50%,
		rgba(0, 0, 0, 0) 100%
	);
	bottom: 0;
	display: flex;
	justify-content: center;
`;

function RoomPage(props) {
	const { user } = useContext(AuthContext); // Get auth user
	const { roomId } = useParams(); // Get Room ID
	const videoRef = createRef();
	const videoRef2 = createRef();
	const videoRef3 = createRef();

	// Firebase RT
	const db = firebase.database();

	// Firebase RT references
	const userStatusDatabaseRef = db.ref(`rooms/${roomId}/members/${user.uid}`);
	const membersRef = db.ref(`rooms/${roomId}/members/`);
	const signalsRef = db.ref(`rooms/${roomId}/signals/${user.uid}/sent`);
	const retSignalsRef = db.ref(`rooms/${roomId}/signals/${user.uid}/toAccept`);

	const [ videoStream, setVideoStream ] = useState(null);
	const [ peers, setPeers ] = useState([]);
	const peersRef = useRef([]);

	const [ hasCamera, setCamera ] = useState(false);
	const [ userInLobby, setUserInLobby ] = useState(true);

	const [ constrains, setConstrains ] = useState({
		audio: true
	});

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
			const devices = await navigator.mediaDevices.enumerateDevices();
			return typeof devices.find((device) => device.kind === 'videoinput') === 'undefined';
		} catch (err) {
			console.log(err.name + ': ' + err.message);
			return [];
		}
	}

	function createPeer(userToSignal, callerId, stream) {
		console.log(`Creating peer from ${callerId} to  ${userToSignal}`);
		const peer = new Peer({
			initiator: true, // tell everyone else that im joining room
			trickle: false,
			stream: stream
		});

		peer.on('signal', (signal) => {
			const userStatusDatabaseRef = db.ref('rooms/' + roomId + '/signals/' + userToSignal + '/sent');
			const newRef = userStatusDatabaseRef.push();
			newRef.set({
				userToSignal,
				callerId,
				signal
			});
		});

		return peer;
	}

	function addPeer(incomingSignal, callerId, signaledUser, stream) {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream
		});
		peer.on('signal', (signal) => {
			const userStatusDatabaseRef = db.ref('rooms/' + roomId + '/signals/' + callerId + '/toAccept');
			const newRef = userStatusDatabaseRef.push();
			newRef.set({
				signal,
				signaledUser
			});
		});

		peer.signal(incomingSignal);

		return peer;
	}

	function onPeerDisconnect(allPeers, disconnectedPeerID, discPeer) {
		// db.ref('rooms/' + roomId + '/signals/' + user.uid).remove();
		console.log('onPeerDisconnect');
		const alReadyExists = peersRef.current.find(({ peerID }) => peerID === disconnectedPeerID);
		peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== disconnectedPeerID);
		console.log('NEW members', peersRef.current);
		console.log(alReadyExists, disconnectedPeerID, peersRef.current);

		setPeers([]); // this removes all TODO: it's wrong pls fix NOW

		if (alReadyExists) {
			console.log('Disconnected:', alReadyExists.peerID);
			discPeer.destroy();
			setPeers([]);
		}
	}

	function onSelfDisconnect() {
		userStatusDatabaseRef.off();
		membersRef.off();
		signalsRef.off();
		retSignalsRef.off();

		peers.forEach((peer) => {
			peer.destroy()
			peer.removeAllListeners('signal');
			peer.removeAllListeners('close');
		});
		peersRef.current = [];
		setPeers([]);

		db.ref('rooms/' + roomId + '/signals/' + user.uid).remove();



		setUserInLobby(true);
	}

	useEffect(
		() => {
			if (videoStream) {
				// videoRef.current.srcObject = videoStream;
				// videoRef2.current.srcObject = videoStream;
				// videoRef3.current.srcObject = videoStream;
			}
		},
		[ videoStream ]
	);

	useEffect(
		() => {
			console.log('UPDATED peers', peers);
			console.log('and peersRef', peersRef.current.slice(0));
		},
		[ peers ]
	);

	const PeerVideo = ({ peer, allPeers, onDisconnect, peerID }) => {
		const ref = useRef();
		const [ stream, setStream ] = useState(null);
		useEffect(() => {
			peer.on('stream', (stream) => {
				setStream(stream);
			});

			peer.on('close', () => {
				// onDisconnect(allPeers, peerID, peer);
				console.log('CLOSING');
			});

			peer.on('error', (err) => {
				// onDisconnect(allPeers,peerID,peer)
				console.log('ERROR', err);
			});
		}, []);

		return (
			// <Video playsInline autoPlay ref={ref} muted />
			<StreamTile stream={stream} autoPlay muted />
		);
	};

	const joinUser = async () => {
		setUserInLobby(false);

		const stream = await navigator.mediaDevices.getUserMedia(constrains);
		setVideoStream(stream);

		//Joining room
		userStatusDatabaseRef.set(isOnlineForDatabase);
		userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
			// The promise returned from .onDisconnect().set() will
			// resolve as soon as the server acknowledges the onDisconnect()
			// request, NOT once we've actually disconnected:
			// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

			// We can now safely set ourselves as 'online' knowing that the
			// server will mark us as offline once we lose connection.
			db.ref('rooms/' + roomId + '/signals/' + user.uid).remove();
			userStatusDatabaseRef.set(isOnlineForDatabase);
		});

		//Get All members
		membersRef.once('value', function(snapshot) {
			const peers = [];
			if (!snapshot.val()) return;
			const memberIds = Object.keys(snapshot.val());
			memberIds
				.filter((id) => id !== user.uid && snapshot.val()[id].data.state !== 'offline')
				.forEach((memberId) => {
					const peer = createPeer(memberId, user.uid, stream);
					peersRef.current.push({
						peerID: memberId,
						peer
					});
					peers.push(peer);
				});
			setPeers(peers);
			console.log('Peers', peersRef.current);
		});

		//listen for joining users
		signalsRef.on('child_added', function(data) {
			const { signal, callerId, userToSignal } = data.val();
			const peer = addPeer(signal, callerId, userToSignal, stream);

			const alReadyExists = typeof peersRef.current.find(({ peerID }) => peerID === callerId) !== 'undefined';

			if (!alReadyExists) {
				peersRef.current.push({
					peerID: callerId,
					peer
				});

				setPeers((users) => [ ...users, peer ]);
			}
			const l = peersRef.current.length;
			console.log('Lister for join Peers', l);
		});

		db.ref(`rooms/${roomId}/signals/`).on('child_removed', function(data) {
			console.log("REMOVED",data.key, user.uid);
			const userLeft = data.key
			if(userLeft == user.uid) {

				console.log("SELF LEAVE")
				return;
			}

			const peerRef = peersRef.current.find(({ peerID }) => {
				console.log(peerID, userLeft);
				return peerID === userLeft;
			});

			if(peerRef) {
				onPeerDisconnect([],userLeft,peerRef.peer);
			}
		})

		retSignalsRef.on('child_added', function(data) {
			console.log(data.val());
			const { signal, signaledUser } = data.val();
			if (signal.sdp) {
				console.log('CUrent refs', peersRef.current);
				const item = peersRef.current.find((p) => p.peerID === signaledUser);
				console.log(item);
				if (item) item.peer.signal(signal);
			}
		});
	};


	const onCameraToggle = (toggleStatus) => {

		if(toggleStatus) videoStream.getVideoTracks()[0].enabled = false;
		else {
			videoStream.getVideoTracks()[0].enabled = true;
		}

	}

	return (
		<RoomErrorBoundary {...props}>
			{userInLobby ? (
				<RoomContainer>
					<VideoContainerSample
						style={{
							margin: '1rem'
						}}
						setConstrains={setConstrains}
					/>
					<ButtonArea
						style={{
							margin: '1rem'
						}}
					>
						<h1>Ready to join?</h1>

						{!userInLobby ? (
							<div>
								<img height="30px" src={CallEndIcon} />
							</div>
						) : (
							<MButton color="primary" onClick={joinUser}>
								Join
							</MButton>
						)}
					</ButtonArea>
				</RoomContainer>
			) : (
				<div
					style={{
						backgroundColor: '#000',
						display: 'flex',
						width: '100%',
						// minHeight: '100vh',
						height: '100vh',
						overflow: 'hidden',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column'
					}}
				>
					<FlexVideoContainer>
						{/* <h1>me: {user.uid}</h1> */}
						<FlexVideoItem rows={(peers.length + 1) / 2}>
							<StreamTile stream={videoStream} autoPlay muted />
						</FlexVideoItem>

						{peers.map((peer, index) => {
							return (
								<FlexVideoItem key={index} rows={(peers.length + 1) / 2}>
									<PeerVideo
										peer={peer}
										peerID={peersRef.current[index].peerID}
										// onDisconnect={onPeerDisconnect}
										allPeers={peersRef.current}
									/>
								</FlexVideoItem>
							);
						})}
					</FlexVideoContainer>

					<BottomArea>
						{/* <MIconButton style={{ margin: '0 .5rem' }} icon={mdiMicrophone} /> */}
						<ToggleIconButton
							style={{ margin: '0 .5rem' }}
							toggleOffStyle={{ backgroundColor: 'transparent'}}
							toggleOnIcon={mdiMicrophone}
							toggleOffIcon={mdiMicrophoneOff}
						/>
						<MButton
							color="primary"
							style={{ color: '#fff', backgroundColor: '#E71D36', margin: '0 .5rem' }}
							onClick={onSelfDisconnect}
							startIcon={mdiPhoneHangup}
						>
							Leave
						</MButton>

						<ToggleIconButton
							style={{ margin: '0 .5rem' }}
							toggleOffStyle={{ backgroundColor: 'transparent'}}
							toggleOnIcon={mdiCamera}
							toggleOffIcon={mdiCameraOff}
							onToggle={onCameraToggle}
						/>

						{/* <MIconButton style={{ margin: '0 .5rem' }} icon={mdiCamera} /> */}
					</BottomArea>
				</div>
			)}
		</RoomErrorBoundary>
	);
}

export default RoomPage;
