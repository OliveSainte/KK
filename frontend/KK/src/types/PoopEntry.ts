import firebase from "firebase/compat/app";
import { GeoPoint } from "firebase/firestore";

export interface PoopEntry {
  id: string;
  number: number;
  createdById: string;
  createdByName: string;
  userProfilePic: string;
  dateTime: firebase.firestore.Timestamp;
  consistency: string;
  location: string;
  comments: Comment[];
  rating: number;
  isFire: boolean;
  isIce: boolean;
  size: string;
  geoPoint?: GeoPoint;
}

export interface Comment {
  id: string;
  userProfilePic: string;
  userId: string; // ID of the user who posted the comment
  userName: string; // Name of the user who posted the comment
  text: string;
  dateTime: firebase.firestore.Timestamp;
  geoPoint?: GeoPoint;
}
