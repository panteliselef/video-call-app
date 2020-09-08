import React, { useState, useContext } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { AuthContext } from '../AuthProvider';


import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

import MButton from '../components/MButton';
import MInputText from '../components/MInputText';

import { mdiGoogle } from '@mdi/js';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// Add the Firebase products that you want to use
import "firebase/auth";

const useStyles = makeStyles((theme) => ({
    container: {
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        margin: '1rem auto',
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
    },
    root: {
        '& .MuiTextField-root': {
            width: '100%',
            margin: '.5rem 0',
            display: 'flex',
        },
    },
    button: {
        display: 'flex'
    }
}));

const SignInPage = () => {
    // const db = firebase.firestore();
    const authContext = useContext(AuthContext);
    const history = useHistory();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onGoogleSignIn = () => {
        const provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // var dbUser = db.collection('users').doc(user.uid).set({email: user.email});
            authContext.setUser(result);
            history.push("/");
            console.log(token, user)
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            // var errorCode = error.code;
            // var errorMessage = error.message;
            // The email of the user's account used.
            // var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            // var credential = error.credential;
            // ...
            console.error(error);
        });
    }

    const onEmailSignIn = () => {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode,errorMessage)
            // ...
          });
    }
    const classes = useStyles();
    return (
        authContext.authenticated ?
            <Redirect to='/' /> :
            <Container className={classes.container}>
                <h2 style={{
                    color: '#333'
                }}>Sign In</h2>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    spacing={3}
                >
                    <Grid item xs={12} >
                        <MInputText value={email} setter={setEmail} label="Email" placeholder="pantelis@gmail.com"></MInputText>
                        <MInputText value={password} setter={setPassword} label="Password" type="password" placeholder="6+ characters"></MInputText>
                    </Grid>
                    <Grid item xs={12}>
                        <MButton color="secondary" style={{
                            width: '100%'
                        }} onClick={onEmailSignIn}>Log In</MButton>

                    </Grid>
                    <Grid item xs={12}>
                        <MButton color="primary" style={{
                            width: '100%'
                        }} onClick={onGoogleSignIn} startIcon={mdiGoogle}>Sign up with Google</MButton>
                    </Grid>
                </Grid>
            </Container>
    )

}

export default SignInPage;