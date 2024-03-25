import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  addDoc,
  Timestamp,
  setDoc,
  doc,
  getDocs,
  limit,
} from "firebase/firestore";
import { firestore } from "../firebase";
import CommentSection from "./CommentSection";
import { Comment } from "../types/PoopEntry";
import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  Stack,
  TextField,
} from "@mui/material";
import { useAuth } from "../App";
import { Profile } from "../types/Profile";
import { StyledBadge } from "../styles/styledComponents";
import { nanoid } from "nanoid";
import { useQuery } from "react-query";

const PoopingComments: React.FC = () => {
  const { currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const { data: profile, isLoading } = useQuery<Profile | null | undefined>(
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

  useEffect(() => {
    // Listen for changes in the 'profiles' collection where the 'online' field is true
    const unsubscribe = onSnapshot(
      query(collection(firestore, "profiles"), where("online", "==", true)),
      (snapshot) => {
        const updatedOnlineUsers: Profile[] = [];
        snapshot.forEach((doc) => {
          updatedOnlineUsers.push({ id: doc.id, ...doc.data() } as Profile);
        });
        setOnlineUsers(updatedOnlineUsers);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Listen for changes in the 'poopingComments' collection
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "poopingComments"),
        orderBy("dateTime", "desc"),
        limit(50) // Order comments by dateTime in descending order
      ),
      (snapshot) => {
        const updatedComments: Comment[] = [];
        snapshot.forEach((doc) => {
          updatedComments.push({ id: doc.id, ...doc.data() } as Comment);
        });
        setComments(updatedComments);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

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

  useEffect(() => {
    // Handle setting user as offline when the window/tab is closed
    const handleWindowClose = () => {
      if (currentUser) {
        const userRef = doc(firestore, "profiles", currentUser.uid);
        setDoc(userRef, { online: false }, { merge: true }); // Set user as offline
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab gains focus, set user as online
        if (currentUser) {
          const userRef = doc(firestore, "profiles", currentUser.uid);
          setDoc(userRef, { online: true }, { merge: true });
        }
      } else if (document.visibilityState === "hidden") {
        // Tab loses focus, set user as offline
        if (currentUser) {
          const userRef = doc(firestore, "profiles", currentUser.uid);
          setDoc(userRef, { online: false }, { merge: true });
        }
      }
    };
    window.addEventListener("beforeunload", handleWindowClose);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [currentUser]);

  if (loading || isLoading) return <CircularProgress />;

  return (
    <div style={{ width: "100%", marginBottom: "4rem", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          backgroundColor: "#171717",
        }}
      >
        <Grid container spacing={2} marginY="1rem">
          {onlineUsers.map((user) => (
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
            label="Write a comment..."
            multiline
            inputProps={{ maxLength: 30 }}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            fullWidth
          />
          <div style={{ textAlign: "center" }}>
            <Button
              onClick={handleCommentSubmit}
              disabled={newCommentText.length < 1}
            >
              Post Comment
            </Button>
          </div>
        </Stack>
      </div>

      <div style={{ zIndex: 1 }}>
        <CommentSection comments={comments} />
      </div>
    </div>
  );
};

export default PoopingComments;
