'use strict';
// 3/18/2019 David Churn created

import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyA_QM1RZzMWV1i4T6z7_IeOHDGB1KO3eKk",
  authDomain: "secondtime-intro.firebaseapp.com",
  databaseURL: "https://secondtime-intro.firebaseio.com",
  projectId: "secondtime-intro",
  storageBucket: "secondtime-intro.appspot.com",
  messagingSenderId: "286432450552"
};
firebase.initializeApp(config);
