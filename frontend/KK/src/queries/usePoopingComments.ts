import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Comment } from "../types/PoopEntry";

const usePoopingComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsQuery = query(
        collection(firestore, "poopingComments"),
        orderBy("dateTime", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(commentsQuery);
      const initialComments = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Comment)
      );
      setComments(initialComments);
      setIsLoading(false);
    };

    fetchComments();

    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "poopingComments"),
        orderBy("dateTime", "desc")
      ),
      (snapshot) => {
        const updatedComments = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Comment)
        );
        setComments(updatedComments);
      }
    );

    return unsubscribe;
  }, []);

  return { comments, isLoading };
};

export default usePoopingComments;
