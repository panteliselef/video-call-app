import React, {useState, useRef, useEffect, createRef} from 'react'
import styled from 'styled-components';


const Video = styled.video`
	width: 100%;
	background-color: #333;
	-webkit-transform: scaleX(-1);
	transform: scaleX(-1);
`;


function VideoContainerSample(props) {

    const [hasMic, setMic] = useState(true);
    const [hasCamera, setCamera] = useState(false);
    const videoRef = createRef();

    async function doA() {
        try{
            const devices = await navigator.mediaDevices.enumerateDevices();
    
            devices.forEach(function (device) {
                console.log(device.kind + ": " + device.label +
                    " id = " + device.groupId);
    
                if(device.kind === "videoinput") {
                    setCamera(true);
                }
            });
        }catch(error){
            setCamera(false);
            setMic(false);
        }
    }

    

    useEffect(()=> {
        
        
        doA();



    },[])


    useEffect(()=>{




    },[hasCamera])
    

    
	const handleCanPlay = () => {
		videoRef.current.play();
	};



	return(
		<div style={{
			minWidth:'450px',
			backgroundColor: '#202124',
			display:'flex',
			flex: '0 1 740px',
			overflow: 'hidden',
            borderRadius: '1rem',
            ...props.style
		}}>
            <div style={{
                width: '100%',
                backgroundColor: '#333',
                position: 'relative'
            }}>
                <Video ref={videoRef} onCanPlay={handleCanPlay} autoPlay muted />
                

                <div style={{
                    width: '100%',
                    position: 'absolute',
                    height: '100px',
                    backgroundColor: 'red',
                    bottom: '0',
                    display: ''
                }}>

                </div>

            </div>



		</div>
	)
}


export default VideoContainerSample