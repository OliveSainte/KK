import {
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../App";
import { query, collection, where, getDocs } from "firebase/firestore";
import { useQuery } from "react-query";
import { firestore } from "../firebase";
import { Profile } from "../types/Profile";
import PoopEntries from "./PoopEntries";
import { useState } from "react";

const UserPage = () => {
  const { currentUser } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
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
      staleTime: Infinity,
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
  const openLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const confirmLogout = () => {
    handleLogout();
    closeLogoutDialog();
  };

  return (
    <div style={{ width: "100%", marginTop: "1.5rem" }}>
      <Avatar
        alt={profile?.username}
        src={profile?.profilePicUrl}
        style={{ width: "150px", height: "150px", margin: "auto" }}
      />
      <Typography variant="h4" style={{ marginTop: "1rem" }} textAlign="center">
        {profile?.username}
      </Typography>
      <div style={{ textAlign: "center" }}>
        <Button
          onClick={openLogoutDialog}
          variant="outlined"
          style={{ marginTop: "2rem", marginBottom: "2rem" }}
          color="warning"
        >
          Logout
        </Button>
      </div>

      <PoopEntries />

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={closeLogoutDialog}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserPage;
