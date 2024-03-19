import React from "react";
import { Button, Card, CardContent, Typography, Grid } from "@mui/material";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { userRepository } from "../repo/UserRepo";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    await signInWithPopup(auth, provider).then(async (result) => {
      const user = result.user;

      await userRepository.saveUser(user).then(() => navigate("/"));
    });
  };

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>
            <Button fullWidth onClick={handleGoogleLogin}>
              Google
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
