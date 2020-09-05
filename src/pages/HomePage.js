import React, { useState, useContext } from "react";
import { AuthContext } from '../AuthProvider';
import Button from '@material-ui/core/Button'
import { Link } from "react-router-dom";
import MButton from '../components/MButton';
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/database";
import RandExp from 'randexp';

import { useHistory } from "react-router-dom";

const HomePage = () => {
    
    const history = useHistory();
    const db = firebase.firestore();
    const {user} = useContext(AuthContext);

    const randomId = new RandExp(/^[0-9A-Z]{4}$/).gen();

    const createRoom = async () => {
        const room = await Promise.all([
            db.collection("rooms").doc(randomId).set({
                ownerId: user.uid,
            }),
            firebase.database().ref('rooms/' + randomId).set({
                ownerId: user.uid,
                connectedMembers: []
            })
        ]);


        try{
            console.log("Room successfully created!");
            history.push(`/${randomId}`);
        }catch(error) {
            console.error(error);
            //cleanup room in firestore or rt database
        }
    }

    return(
        <div>
            <h1>HomePage</h1>
            {/* <Link to='/signin'>
                <Button variant="contained" color="primary">go to sign in</Button>
            </Link> */}
            <MButton color="secondary" onClick={createRoom}>New Meeting</MButton>


        </div>
    )
} 

export default HomePage;