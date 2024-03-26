import React, { useEffect, useState } from "react";
import { collection, addDoc, Timestamp, doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import CommentSection from "./CommentSection";
import { Comment } from "../types/PoopEntry";
import {
  Avatar,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { useAuth } from "../App";
import { StyledBadge } from "../styles/styledComponents";
import { nanoid } from "nanoid";
import SendIcon from "@mui/icons-material/Send";
import usePoopingComments from "../queries/usePoopingComments";
import useOnlineUsers from "../queries/useOnlineUsers";
import useUserProfile from "../queries/useUserProfile";

const PoopingComments: React.FC = () => {
  const { currentUser } = useAuth();
  const { comments, isLoading: isLoadingComments } = usePoopingComments();
  const { onlineUsers, isLoading: isLoadingOnlineUsers } = useOnlineUsers();
  const [newCommentText, setNewCommentText] = useState("");
  const onlineUsersNoCurrent = onlineUsers.filter(
    (u) => u.id !== currentUser?.uid
  );
  const { profile, isLoading } = useUserProfile(currentUser?.uid);

  useEffect(() => {
    const updateOnlineStatus = async () => {
      if (currentUser) {
        const userRef = doc(firestore, "profiles", currentUser.uid);
        try {
          await setDoc(userRef, { online: true }, { merge: true }); // Set user as online
        } catch (error) {
          console.error("Error updating online status:", error);
        }
      }
    };

    updateOnlineStatus(); // Call the function when the component mounts

    // Clean-up function to set the user as offline when the component unmounts
    return () => {
      if (currentUser) {
        const userRef = doc(firestore, "profiles", currentUser.uid);
        setDoc(userRef, { online: false }, { merge: true }); // Set user as offline
      }
    };
  }, [currentUser]);

  const handleCommentSubmit = async () => {
    if (newCommentText.trim() === "") {
      return; // Don't submit empty comments
    }

    // Construct a new comment object
    const newComment: Comment = {
      id: nanoid(),
      userId: currentUser?.uid || "",
      userName: profile?.username ?? "Anonymous", // You can replace this with the actual username if available
      userProfilePic: profile?.profilePicUrl ?? "/KK.svg", // You can replace this with the actual profile pic URL if available
      text: newCommentText.trim(),
      dateTime: Timestamp.now(), // Assuming you're using the client-side timestamp
    };

    // Add the new comment to Firestore
    await addDoc(collection(firestore, "poopingComments"), newComment);

    // Clear the input field after submitting the comment
    setNewCommentText("");
  };

  if (isLoadingComments || isLoadingOnlineUsers || isLoading)
    return <CircularProgress />;

  return (
    <div
      style={{ width: "97.7vh", marginBottom: "4rem", position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          backgroundColor: "#171717",
        }}
      >
        <Grid container spacing={2} marginY="1rem">
          <Grid item>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                alt={profile?.profilePicUrl}
                src={profile?.profilePicUrl}
              />
            </StyledBadge>
          </Grid>

          {onlineUsersNoCurrent.map((user) => (
            <Grid item key={user.id}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <Avatar alt={user.username} src={user.profilePicUrl} />
              </StyledBadge>
            </Grid>
          ))}
        </Grid>
        <Stack marginY="1rem">
          <TextField
            label="Poop with friends!"
            inputProps={{ maxLength: 30 }}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleCommentSubmit}
                  disabled={newCommentText.length < 1}
                >
                  <SendIcon />
                </IconButton>
              ),
            }}
          />
        </Stack>
      </div>

      <div style={{ zIndex: 1 }}>
        <CommentSection comments={comments} />
      </div>
    </div>
  );
};

export default PoopingComments;
