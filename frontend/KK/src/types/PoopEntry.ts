import firebase from "firebase/compat/app";

export interface PoopEntry {
  id: string;
  createdById: string;
  createdByName: string;
  dateTime: firebase.firestore.Timestamp;
  type: string;
  consistency: string;
  color: string;
  notes: string;
}
