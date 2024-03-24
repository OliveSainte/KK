import { Button, Card, CardContent, Grid, Avatar, Box } from "@mui/material";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    await signInWithPopup(auth, provider).then(() => {
      navigate("/");
    });
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: "100vh" }} // Center vertically
    >
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined">
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <Avatar
              sx={{
                width: "15rem", // Adjust the width as desired
                height: "15rem", // Adjust the height as desired
                display: "block",
              }}
              alt="KK"
              src="/KK.svg"
            />
          </Box>

          <CardContent>
            <Button fullWidth onClick={handleGoogleLogin}>
              Login with Google
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
