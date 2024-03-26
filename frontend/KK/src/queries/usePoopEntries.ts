import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { PoopEntry } from "../types/PoopEntry";

const usePoopEntries = () => {
  const { data: initialPoopEntries, isLoading: initialLoading } = useQuery<
    PoopEntry[],
    Error
  >(
    "poopEntries",
    async () => {
      const querySnapshot = await getDocs(
        query(
          collection(firestore, "poopEntries"),
          orderBy("dateTime", "desc"),
          limit(30)
        )
      );

      const entries: PoopEntry[] = [];

      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
      });

      return entries;
    },
    { staleTime: 60000 }
  );

  const [poopEntries, setPoopEntries] = useState<PoopEntry[]>(
    initialPoopEntries || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(firestore, "poopEntries"), orderBy("dateTime", "desc")),
      (snapshot) => {
        const updatedPoopEntries: PoopEntry[] = [];
        snapshot.forEach((doc) => {
          updatedPoopEntries.push({ id: doc.id, ...doc.data() } as PoopEntry);
        });
        setPoopEntries(updatedPoopEntries);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { poopEntries, isLoading };
};

export default usePoopEntries;
