import { Box, Typography, Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../App";

const UserPage = () => {
  const { currentUser } = useAuth();
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      // Redirect or perform any necessary actions after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4">User Information</Typography>
      <Typography variant="body1">Name: {currentUser?.displayName}</Typography>
      <Typography variant="body1">Email: {currentUser?.email}</Typography>
      <Button onClick={handleLogout} variant="contained" color="primary">
        Logout
      </Button>
    </Box>
  );
};

export default UserPage;
