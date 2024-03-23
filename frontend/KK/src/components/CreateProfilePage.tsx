import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Snackbar,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { useAuth } from "../App";
import { firestore } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Profile } from "../types/Profile";
import { useQueryClient } from "react-query";

const CreateProfilePage = () => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleCreateProfile = async () => {
    if (!currentUser || username.length <= 3 || username.length > 15) return;

    setLoading(true);

    const newProfile: Profile = {
      username: username,
      id: currentUser.uid,
    };

    try {
      await setDoc(doc(firestore, "profiles", currentUser.uid), newProfile);
      queryClient.setQueryData(["profiles", currentUser.uid], newProfile);
      setUsername("");
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Avatar
        alt="KK"
        src="/KK.svg"
        style={{ width: "200px", height: "200px", margin: "auto" }}
      />
      <TextField
        label="Choose a Username"
        variant="outlined"
        fullWidth
        value={username}
        inputProps={{ maxLength: 15 }}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={username.length <= 1 || loading}
        onClick={() => setOpenDialog(true)}
      >
        {loading ? <CircularProgress size={24} /> : "Create Profile"}
      </Button>

      {/* Dialog to confirm username */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Confirm Username</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to choose <strong>{username}</strong> as your
            username? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProfile}
            color="primary"
            autoFocus
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for showing success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Profile created successfully!"
      />
    </div>
  );
};

export default CreateProfilePage;
