import { useQuery } from "react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { PoopEntry } from "../types/PoopEntry";

const useUserPoopEntries = (userId: string | undefined) => {
  const {
    isLoading,
    data: poopEntries,
    error,
  } = useQuery<PoopEntry[], Error>(
    ["userPoopEntries", userId],
    async () => {
      if (!userId) throw new Error("User ID is undefined.");

      const userPoopsQuery = query(
        collection(firestore, "poopEntries"),
        orderBy("dateTime", "desc"),
        where("createdById", "==", userId)
      );

      const querySnapshot = await getDocs(userPoopsQuery);
      const entries: PoopEntry[] = [];

      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
      });

      return entries;
    },
    { staleTime: 120000 }
  );

  return { isLoading, poopEntries, error };
};

export default useUserPoopEntries;
