import { Typography, Button, Avatar } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../App";
import { Profile } from "../types/Profile";
import { query, collection, where, getDocs } from "firebase/firestore";
import { useQuery } from "react-query";
import { firestore } from "../firebase";

const UserPage = () => {
  const { currentUser } = useAuth();
  const { data: profile } = useQuery<Profile | null | undefined>(
    ["profiles", currentUser?.uid],
    async () => {
      if (currentUser) {
        try {
          const userPoopsQuery = query(
            collection(firestore, "profiles"),
            where("id", "==", currentUser?.uid)
          );
          const querySnapshot = await getDocs(userPoopsQuery);
          const entries: Profile[] = [];
          querySnapshot.forEach((doc) => {
            entries.push({ id: doc.id, ...doc.data() } as Profile);
          });
          // Check if user has a profile, if not, navigate to create profile page
          if (entries.length === 0) {
            return null;
          } else {
            return entries[0];
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          return null;
        }
      }
    },
    {
      staleTime: 120000,
    }
  );

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      // Redirect or perform any necessary actions after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={{ marginBottom: "4rem", textAlign: "center" }}>
      <Avatar
        alt={profile?.username}
        src="/KK.svg"
        style={{ width: "150px", height: "150px", margin: "auto" }}
      />
      <Typography variant="h4" style={{ marginTop: "1rem" }}>
        {profile?.username}
      </Typography>

      <Button
        onClick={handleLogout}
        variant="outlined"
        style={{ marginTop: "2rem" }}
        fullWidth
        color="primary"
      >
        Logout
      </Button>
    </div>
  );
};

export default UserPage;
