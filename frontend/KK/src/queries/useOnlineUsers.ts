import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Profile } from "../types/Profile";

const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const onlineUsersQuery = query(
        collection(firestore, "profiles"),
        where("online", "==", true)
      );

      const querySnapshot = await getDocs(onlineUsersQuery);
      const initialOnlineUsers = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Profile)
      );
      setOnlineUsers(initialOnlineUsers);
      setIsLoading(false);
    };

    fetchOnlineUsers();

    const unsubscribe = onSnapshot(
      query(collection(firestore, "profiles"), where("online", "==", true)),
      (snapshot) => {
        const updatedOnlineUsers = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Profile)
        );
        setOnlineUsers(updatedOnlineUsers);
      }
    );

    return unsubscribe;
  }, []);

  return { onlineUsers, isLoading };
};

export default useOnlineUsers;
