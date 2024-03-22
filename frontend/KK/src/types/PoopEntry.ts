import firebase from "firebase/compat/app";

export interface PoopEntry {
  id: string;
  number: number;
  createdById: string;
  createdByName: string;
  dateTime: firebase.firestore.Timestamp;
  type: string;
  consistency: string;
  color: string;
  notes: string;
  comments: Comment[];
  atHome: boolean;
  rating: number;
}

export interface Comment {
  id: string;
  userId: string; // ID of the user who posted the comment
  userName: string; // Name of the user who posted the comment
  text: string;
}
