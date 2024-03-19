import firebase from "firebase/compat/app";

export const formatDateTime = (timestamp: firebase.firestore.Timestamp) => {
  const date = timestamp.toDate(); // Convert Firestore Timestamp to Date
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });
};
