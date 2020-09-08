import React from "react";
import { useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button'
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// Add the Firebase products that you want to use
import "firebase/auth";

const LogOutPage = () => {
    const history = useHistory();
    
    const onLogOut = (event) => {
        event.preventDefault();
      
        firebase
        .auth()
        .signOut()
        .then(res => {
           history.push("/");
         })
    }

    return(
        <div>
            <Button variant="contained" color="primary" onClick={onLogOut}> Log out</Button>
        </div>
    )

} 

export default LogOutPage;