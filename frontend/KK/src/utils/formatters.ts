import firebase from "firebase/compat/app";

export const formatDateTime = (
  timestamp: firebase.firestore.Timestamp | undefined | null
) => {
  if (!timestamp) return "";
  const date = timestamp.toDate(); // Convert Firestore Timestamp to Date
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
