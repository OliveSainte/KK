import firebase from "firebase/compat/app";
export interface Profile {
  id: string;
  lastConnection: firebase.firestore.Timestamp;
  username: string;
  profilePicUrl: string;
}
