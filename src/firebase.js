import firebase from "firebase";
// import "firebase/auth";
// import "firebase/database";
// import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUYtkj0Xmh6R2PF2VgUBm7y9TcDiwQubc",
  authDomain: "funchat-66d30.firebaseapp.com",
  databaseURL: "https://funchat-66d30-default-rtdb.firebaseio.com",
  projectId: "funchat-66d30",
  storageBucket: "funchat-66d30.appspot.com",
  messagingSenderId: "310574963260",
  appId: "1:310574963260:web:8f82f92f00a5a38a3e8139",
  measurementId: "G-J7MBWWZP5X"
};
const firebaseApp=firebase.initializeApp(firebaseConfig);

const db=firebaseApp.firestore();

export {db};

export default firebase;
