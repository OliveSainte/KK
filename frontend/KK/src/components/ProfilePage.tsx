import {
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  ButtonGroup,
  CircularProgress,
} from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../App";
import PoopEntries from "./PoopEntries";
import { useState } from "react";
import { StyledBadge } from "../styles/styledComponents";
import { useNavigate } from "react-router-dom";
import useUserProfile from "../queries/useUserProfile";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { profile, isLoading } = useUserProfile(currentUser?.uid);

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
    <div style={{ marginBottom: "4rem", width: "100%", marginTop: "1.5rem" }}>
      {isLoading && <CircularProgress />}
      <div style={{ textAlign: "center" }}>
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
        >
          <Avatar
            alt="/KK.svg"
            srcSet={profile?.profilePicUrl}
            src={profile?.profilePicUrl}
            style={{ width: "150px", height: "150px", margin: "auto" }}
          />
        </StyledBadge>
      </div>

      <Typography variant="h4" style={{ marginTop: "1rem" }} textAlign="center">
        {profile?.username}
      </Typography>
      <div style={{ textAlign: "center" }}>
        <Stack spacing="1rem" marginY="2rem">
          <ButtonGroup fullWidth>
            <Button
              onClick={() => navigate("/pooping-with-friends")}
              variant="outlined"
              color="success"
            >
              Pooping with friends
            </Button>
            <Button
              onClick={openLogoutDialog}
              variant="outlined"
              color="warning"
            >
              Logout
            </Button>
          </ButtonGroup>
        </Stack>
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

export default ProfilePage;
