import React, { useEffect, useState, useRef, useContext } from 'react';
import { AuthContext } from '../AuthProvider';
import styled from 'styled-components';

const Video = styled.video`
	width: 100%;
	background-color: #333;
	-webkit-transform: scaleX(-1);
	transform: scaleX(-1);
`;

const CircledImage = styled.img`
	max-width: 150px;
    height: 100%;
	max-height: 150px;
	border-radius: 100%;
	object-fit: cover;
`;

function StreamTile({stream, ...rest }) {
	const { user } = useContext(AuthContext); // Get auth user
	const { photoURL: imageSrc } = user;

	const [ hasAudio, setAudio ] = useState(false);
    const [ hasVideo, setVideo ] = useState(false);
    
    const [ containerHeight, setContainerHeight] = useState(0);

    const videoRef = useRef();
    const conRef = useRef();

    function calcHeight(){

        const width = conRef.current.offsetWidth;
        const height = width/1.777;
        setContainerHeight(height);

    }

	useEffect(
		() => {
			if (!stream) return;

			setAudio(stream.getAudioTracks().length >= 1);

			if(stream.getVideoTracks().length>=1){
				if(stream.getVideoTracks()[0].enabled)
					setVideo(true);
				else setVideo(false);
			}else setVideo(false);

			console.log('Updated Stream');
		},
		[ stream ]
    );
    
    useEffect(()=>{
        if(hasVideo) videoRef.current.srcObject = stream;
        else {
            calcHeight();
            window.addEventListener('resize',calcHeight)
        }
        return ()=> {
            if(!hasVideo) window.removeEventListener('resize',calcHeight);
        }
    },[hasVideo,stream])

	return (
		<React.Fragment>
			{/* {hasAudio && <p style={{ color: '#fff' }}>Has Audio</p>} */}
			{hasVideo ? (
				<Video ref={videoRef} {...rest} />
			) : (
				<div
                    ref={conRef}
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
                        backgroundColor:'red',
                        alignItems:'center',
                        height: containerHeight
					}}
				>
					<CircledImage src={imageSrc} />
				</div>
			)}
		</React.Fragment>
	);
}

export default StreamTile;
