import firebase from "firebase/compat/app";
import { Timestamp } from "firebase/firestore";

export const formatDateTime = (
  timestamp: firebase.firestore.Timestamp | undefined | null
) => {
  if (!timestamp) return "";
  const typedTimestamp = new Timestamp(
    timestamp.seconds,
    timestamp.nanoseconds
  );
  const date = typedTimestamp.toDate(); // Convert Firestore Timestamp to Date
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false, // Display in 24-hour format
  });
};
