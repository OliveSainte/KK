import { ChangeEvent, useState } from "react";
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
  CardContent,
  Card,
  Typography,
} from "@mui/material";
import { useAuth } from "../App";
import { firestore, storage } from "../firebase";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import { Profile } from "../types/Profile";
import { useQueryClient } from "react-query";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { brown } from "../../public/colors";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB in bytes

const CreateProfilePage = () => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<File | null>(null); // State to store uploaded profile picture
  const { currentUser } = useAuth();

  const handleCreateProfile = async () => {
    if (
      !currentUser ||
      !profilePic ||
      username.length <= 1 ||
      username.length > 15
    )
      return;

    setLoading(true);
    setOpenDialog(false);

    const profilePicUrl = await uploadProfilePic(profilePic);
    const newProfile: Profile = {
      username: username.trim(),
      id: currentUser.uid,
      profilePicUrl: profilePicUrl ?? "/KK.svg",
      lastConnection: Timestamp.now(),
    };

    try {
      await setDoc(doc(firestore, "profiles", currentUser.uid), newProfile);
      queryClient.setQueryData(["profiles", currentUser.uid], newProfile);
      setUsername("");
      setProfilePic(null); // Clear profile picture state after uploading
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle profile picture upload
  const handleProfilePicChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(false);
    const files = event.target.files ?? [];
    if (files.length > 0) {
      const file = files[0];
      if (file.size <= MAX_FILE_SIZE_BYTES) setProfilePic(file);
      else setError(true);
    }
  };

  // Function to upload profile picture to Firebase Storage
  const uploadProfilePic = async (file: File): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      const storageRef = ref(storage, `${currentUser.uid}/${file.name}`); // Reference to the root of Firebase Storage
      await uploadBytes(storageRef, file); // Upload the file
      const downloadURL = await getDownloadURL(storageRef); // Get the download URL
      return downloadURL; // Return the download URL
    } catch (error) {
      return null;
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
      <Card>
        <CardContent>
          {/* Display uploaded profile picture */}
          {profilePic ? (
            <Avatar
              alt="Profile Pic"
              src={URL.createObjectURL(profilePic)}
              style={{ width: "150px", height: "150px", margin: "auto" }}
              onClick={() =>
                document.getElementById("profile-pic-upload")?.click()
              }
            />
          ) : (
            <label htmlFor="profile-pic-upload">
              <Avatar
                alt="Add Photo"
                style={{ width: "150px", height: "150px", margin: "auto" }}
              >
                <AddPhotoAlternateIcon />
              </Avatar>
            </label>
          )}
          {/* Input for uploading profile picture */}
          <input
            accept="image/*"
            id="profile-pic-upload"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleProfilePicChange(e)}
          />

          <Typography marginY="1rem" variant="h6" color={brown}>
            {error ? "The file must be smaller than 10MB" : ""}
          </Typography>
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
            variant="outlined"
            color="primary"
            fullWidth
            disabled={username.length <= 1 || loading || !profilePic}
            onClick={() => setOpenDialog(true)}
          >
            {loading ? <CircularProgress size={24} /> : "Create Profile"}
          </Button>
        </CardContent>
      </Card>

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
