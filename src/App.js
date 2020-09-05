import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import SignInPage from './pages/SignInPage'
import HomePage from './pages/HomePage'
import PrivateRoute from './PrivateRoute'
import LogOutPage from './pages/LogOutPage'
import RoomPage from './pages/RoomPage'
import ClassRoomPage from './pages/ClassRoomPage'
import { AuthProvider } from './AuthProvider'
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzlr20m70RkDr7W4lvqZb8CR0ibSSuFVQ",
  authDomain: "video-call-app-e148d.firebaseapp.com",
  databaseURL: "https://video-call-app-e148d.firebaseio.com",
  projectId: "video-call-app-e148d",
  storageBucket: "video-call-app-e148d.appspot.com",
  messagingSenderId: "377295034265",
  appId: "1:377295034265:web:d9f56f00184044f9c06508"
};
// import logo from './logo.svg';
// import './App.css';

function App() {

  firebase.initializeApp(firebaseConfig);

  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/signin">
            <SignInPage />
          </Route>
          <Route path="/logout">
            <LogOutPage />
          </Route>
          <PrivateRoute exact path="/" component={HomePage}></PrivateRoute>
          <PrivateRoute path="/:roomId" component={RoomPage}></PrivateRoute>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
