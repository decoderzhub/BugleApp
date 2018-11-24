
import * as firebase from 'firebase';

// should go in a secret file
const config = {
    apiKey: "AIzaSyAQd-VRMNDKZracvqdpsGYcIzjOlczNR_Y",
    authDomain: "instachat-d1343.firebaseapp.com",
    databaseURL: "https://instachat-d1343.firebaseio.com/",
    storageBucket: "gs://instachat-d1343.appspot.com",
    messagingSenderId: "696929020023"
};
firebase.initializeApp(config);

export default firebase;
