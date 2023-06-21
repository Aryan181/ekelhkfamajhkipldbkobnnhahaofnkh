import React from 'react';
import ReactDOM from 'react-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth';
import { FIREBASE_CONFIG } from './const';

export const firebase = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(firebase);

export const App = (props) => {
  const [user, setUser] = React.useState(undefined);
  const signIn = (e) => {
    console.log('App component rendered');
    e.preventDefault();
    console.log('signIn function called');
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`);
        return;
      }
  
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
        .then((res) => {
          const { isNewUser } = getAdditionalUserInfo(res);
          console.log(isNewUser ? "This user just registered" : "Existing User")
          console.log('signed ind!');
          if (isNewUser) {
            // create entry in db
            // https://ava-backend-0jva.onrender.com/signup
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ authId: res.user.accessToken })
            };
            fetch('https://ava-backend-0jva.onrender.com/signup', requestOptions)
              .then(response => console.log(response.json()))
          }
        })
        .catch((err) => {
          alert(`SSO ended with an error: ${err}`);
        });
    });
  };
  React.useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user && user.uid) {
        console.log(`User UID: ${user.uid}`);
        setUser(user);
        console.log(`User auth token ${user.accessToken}`)
        chrome.storage.local.set({ user_uid: user.uid, auth_token: user.accessToken });
        console.log('UID stored in Chrome storage');
      } else {
        console.log('UID not stored');
        setUser(null);
        chrome.storage.local.remove('user_uid');
      }
    });
  }, []);
  
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'transparent',
    width: '50%',
  };
  
  
  
  

  const buttonStyle = {
    backgroundColor: '#4285F4',
    color: 'white',
    fontSize: '14px',
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '16px',
    margin: '0 auto',
   
    marginLeft: '62px'
  };
  

  if (undefined === user) return <h1>Loading...</h1>;

  if (user != null)
    return (
      <div style={containerStyle}>
        
    
        <button onClick={auth.signOut.bind(auth)} style={buttonStyle}>
          Sign Out
        </button>
      </div>
    );

  return (
    <div style={containerStyle}>
      <button onClick={signIn} style={buttonStyle}>
        Sign In with Google
      </button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
