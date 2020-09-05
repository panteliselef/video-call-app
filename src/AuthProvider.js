import React, { useEffect, useState, createContext } from "react"
import * as firebase from "firebase/app";
import "firebase/auth";

export const AuthContext = createContext(
  {
    user: {},
    authenticated: false,
    setUser: null,
    loadingAuthState: false,
}
);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      console.log("USER",user);
      setLoadingAuthState(false);
  });
  }, []);
  return (
    <AuthContext.Provider
    value={{
          user,
          authenticated: user !== null,
          setUser,
          loadingAuthState
    }}>
      {children} 
  </AuthContext.Provider>
  );
}