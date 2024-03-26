import { useQuery } from "react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { Profile } from "../types/Profile";

const useUserProfile = (userId: string | undefined) => {
  const {
    isLoading,
    data: profile,
    error,
  } = useQuery<Profile | null | undefined, Error>(
    ["profiles", userId],
    async () => {
      if (!userId) throw new Error("User ID is undefined.");

      try {
        const userPoopsQuery = query(
          collection(firestore, "profiles"),
          where("id", "==", userId)
        );
        const querySnapshot = await getDocs(userPoopsQuery);

        const entries: Profile[] = [];
        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() } as Profile);
        });

        // Check if user has a profile, if not, return null
        if (entries.length === 0) return null;

        return entries[0];
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Failed to fetch profile");
      }
    },
    {
      staleTime: Infinity,
    }
  );

  return { isLoading, profile, error };
};

export default useUserProfile;
