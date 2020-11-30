import firebase from "firebase"

const firebaseConfig = {
    apiKey: "AIzaSyAtrB3bdi84td2JKm1dPDKLNUOSVMNY0wg",
    authDomain: "network-b12a5.firebaseapp.com",
    databaseURL: "https://network-b12a5.firebaseio.com",
    projectId: "network-b12a5",
    storageBucket: "network-b12a5.appspot.com",
    messagingSenderId: "172202759532",
    appId: "1:172202759532:web:9e99479d6cc9ca15338f49"
};

firebase.initializeApp(firebaseConfig)

firebase.firestore().settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
})
firebase.firestore().enablePersistence()
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

export const db = firebase.firestore()
export const auth = firebase.auth()
export const storageRef = firebase.storage().ref('/inventory')