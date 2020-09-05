import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from '../AuthProvider';
import { useParams } from "react-router-dom";
import * as firebase from "firebase/app";


class ClassRoomPage extends React.Component {
    db = firebase.firestore();
    unsubscribe;

    static contextType = AuthContext

    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            roomId: props.match.params.roomId,
            roomData: '',
            owner: '',
            user: {}
        };
    }
    
    getUserById = (uid) => {
        const docRef = this.db.collection("users").doc(uid);
        docRef.get().then((doc) => {
            if (doc.exists) {
                this.setState({owner:doc.data().email});
                console.log("Document data:", doc.data());
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }

    componentDidMount() {
        this.setState({user: this.context});
        this.unsubscribe = this.db.collection("rooms").doc(this.state.roomId)
        .onSnapshot( (doc) => {
            if (doc.exists) {
                this.setState({roomData:doc.data()});
                this.getUserById(doc.data().ownerId);
                console.log("Document data:", doc.data());
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });


        this.db.collection("rooms").doc(this.state.roomId).get().then( (doc) => {
            this.db.collection("rooms").doc(this.state.roomId).update({
                connectedMembers: firebase.firestore.FieldValue.arrayUnion(this.state.user.user.uid)
            });
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }
    componentWillUnmount(){
        // this.unsubscribe();
        // await this.db.collection("rooms").doc(this.state.roomId).update({
        //     connectedMembers: firebase.firestore.FieldValue.arrayRemove(this.state.user.user.uid)
        // });
        console.log("LEAVING")
    }




    render() {
        return (
            <div>
                <h1>{this.state.roomId}</h1>
                <p>Owner: {this.state.owner}</p>
                <ul>
                    {this.state.roomData.connectedMembers && this.state.roomData.connectedMembers.map(member => <li key={member}>{member}</li>)}
    
                </ul>
    
            </div>
        )

    }
}


export default ClassRoomPage;