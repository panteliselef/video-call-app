import React, { useState, useEffect, createRef, useCallback } from 'react';
import styled from 'styled-components';

import { mdiMicrophone, mdiCamera, mdiCameraOff} from '@mdi/js';
import MButton from '../components/MButton';

const Video = styled.video`
	width: 100%;
	background-color: #333;
	-webkit-transform: scaleX(-1);
	transform: scaleX(-1);
`;

function VideoContainerSample({setConstrains,style}) {
	const [ videoStream, setVideoStream ] = useState(null);
	const [ hasMic, setMic ] = useState(true);
	const [ hasCamera, setCamera ] = useState(false);
	const [ isCameraDisabled, setCameraDisabled] = useState(true);
	const videoRef = createRef();


	const doA = useCallback(async ()=>{
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();

			devices.forEach(function(device) {
				// console.log(device.kind + ': ' + device.label + ' id = ' + device.groupId);
				if (device.kind === 'videoinput') {
					setCamera(true);
					setCameraDisabled(false);
					setConstrains({audio:true,video:true})
				}
			});
		} catch (error) {
			setConstrains({audio:false,video:false})
			setCamera(false);
			setCamera(true);
			setMic(false);
		}
	},[setConstrains])

	useEffect(() => {
		doA();
	}, [doA]);

	useEffect(
		() => {
			navigator.mediaDevices.getUserMedia({ audio: true, video: !isCameraDisabled }).then((stream) => {
				setVideoStream(stream);
			});
			// console.log(isCameraDisabled);
		},
		[ isCameraDisabled ]
	);

	useEffect(
		() => {
			if(videoStream){
				videoRef.current.srcObject = videoStream;
			}
		},
		[ videoStream, videoRef ]
	);

	const handleCanPlay = () => {
		videoRef.current.play();
	};

	const toggleCamera = () => {
		if(hasCamera) {
			setCameraDisabled(!isCameraDisabled);
			setConstrains({audio:true,video:isCameraDisabled})
		}else{
			setCameraDisabled(true);
			setConstrains({audio:true,video:false})
		}
	}

	return (
		<div
			style={{
				minWidth: '450px',
				backgroundColor: '#202124',
				display: 'flex',
				flex: '0 1 740px',
				overflow: 'hidden',
				borderRadius: '0.5rem',
				...style
			}}
		>
			<div
				style={{
					width: '100%',
					backgroundColor: '#333',
					position: 'relative'
				}}
			>
				<Video ref={videoRef} onCanPlay={handleCanPlay} autoPlay muted />

				<div
					style={{
						width: '100%',
						position: 'absolute',
						padding:'1rem 0',
						backgroundImage:
							'-webkit-linear-gradient(bottom,rgba(0,0,0,0.7) 0,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%)',
						bottom: '0',
						display: 'flex',
						justifyContent: 'space-evenly'
					}}
				>
					<MButton color="primary" startIcon={mdiMicrophone}>Mic Enabled</MButton>

					{!isCameraDisabled?
						<MButton color="primary" startIcon={mdiCamera} onClick={toggleCamera}>Camera Enabled </MButton>
						:<MButton color="primary" startIcon={mdiCameraOff} onClick={toggleCamera}>Camera Disabled </MButton>
					}

				</div>
			</div>
		</div>
	);
}

export default VideoContainerSample;
