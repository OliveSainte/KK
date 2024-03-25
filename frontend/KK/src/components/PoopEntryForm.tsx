import React, { useState, FormEvent } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Rating,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Comment, PoopEntry } from "../types/PoopEntry";
import {
  GeoPoint,
  Timestamp,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { nanoid } from "nanoid";
import { useAuth } from "../App";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Profile } from "../types/Profile";

const PoopEntryForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Access the query client
  const [isSubmittingPoop, setIsSubmittingPoop] = useState<boolean>(false); // Access the query client

  const { data: profile, isLoading: isLoadingProfile } = useQuery<
    Profile | null | undefined
  >(
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

  const { isLoading: isLoadingPoopEntries, data: poopEntries } = useQuery<
    PoopEntry[],
    Error
  >(
    ["userPoopEntries", currentUser?.uid],
    async () => {
      if (!currentUser) throw new Error("User not authenticated.");
      const userPoopsQuery = query(
        collection(firestore, "poopEntries"),
        where("createdById", "==", currentUser.uid),
        orderBy("dateTime", "desc")
      );
      const querySnapshot = await getDocs(userPoopsQuery);
      const entries: PoopEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
      });
      return entries;
    },
    {
      staleTime: 120000,
    }
  );
  const [size, setSize] = useState<"big" | "small" | "">("");
  const [consistency, setConsistency] = useState<"soft" | "hard" | "">("");
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<"home" | "away" | "">("");
  const [rating, setRating] = useState<number>(-1);

  const allLoading =
    isSubmittingPoop || isLoadingProfile || isLoadingPoopEntries;
  const isSubmitPoopDisabled = (): boolean => {
    return !location || !size || !consistency || rating === -1 || allLoading;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitPoopDisabled()) return;
    if ("geolocation" in navigator) {
      setIsSubmittingPoop(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const geoLocation = new GeoPoint(latitude, longitude);

          // Now you can use the userGeopoint in your Firestore query or wherever needed
          await postNewPoop(geoLocation);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setIsSubmittingPoop(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setIsSubmittingPoop(false);
    }
  };

  const postNewPoop = async (geoPoint: GeoPoint) => {
    if (!poopEntries) return;
    let isFire = false;
    let isIce = false;

    // Check if it's the third or more poop today
    const todayEntries = poopEntries.filter((entry) => {
      const entryDate = entry.dateTime.toDate();
      const currentDate = new Date();
      return (
        entryDate.getDate() === currentDate.getDate() &&
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    });
    if (todayEntries.length >= 3) {
      isFire = true;
    }

    // Check if it's the first poop in more than 36 hours
    if (poopEntries.length > 0) {
      const lastPoopDate = poopEntries[0].dateTime.toDate();
      const currentDate = new Date();
      const hoursSinceLastPoop =
        Math.abs(currentDate.getTime() - lastPoopDate.getTime()) /
        (1000 * 60 * 60);
      if (hoursSinceLastPoop > 36) {
        isIce = true;
      }
    }

    const newComment: Comment = {
      id: nanoid(),
      userProfilePic: profile?.profilePicUrl ?? "/KK.svg",
      userId: currentUser?.uid || "",
      userName: profile?.username || "Anonymous",
      text: comment.trim(),
      dateTime: Timestamp.now(),
    };

    const newPoop: PoopEntry = {
      id: nanoid(),
      number: poopEntries?.length + 1,
      createdById: currentUser?.uid as string,
      createdByName: profile?.username as string,
      userProfilePic: profile?.profilePicUrl as string,
      dateTime: Timestamp.now(),
      size,
      consistency,
      comments: !comment ? [] : [newComment],
      location,
      rating,
      isFire,
      isIce,
      geoPoint,
    };

    await setDoc(doc(firestore, "poopEntries", newPoop.id), newPoop).then(
      () => {
        // Update userPoopEntries and poopEntries data
        queryClient.setQueryData<PoopEntry[]>("userPoopEntries", (prevData) => [
          newPoop,
          ...(prevData || []),
        ]);

        queryClient.setQueryData<PoopEntry[]>("poopEntries", (prevData) => [
          newPoop,
          ...(prevData || []),
        ]);

        setSize("");
        setLocation("");
        setConsistency("");
        setComment("");
        setRating(0);
        queryClient.invalidateQueries("userPoopEntries");
        queryClient.invalidateQueries("poopEntries");
        setIsSubmittingPoop(false);
        navigate("/");
      }
    );
  };

  return (
    <div style={{ marginBottom: "4rem", textAlign: "center" }}>
      {isLoadingPoopEntries || isLoadingProfile ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ width: "80%", maxWidth: "400px" }}
          >
            <Typography variant="h4" gutterBottom align="center">
              Pooped?
            </Typography>

            <ToggleButtonGroup
              value={location}
              exclusive
              onChange={(_, newValue) => setLocation(newValue)}
              aria-label="Location"
              fullWidth
              style={{ marginTop: "16px" }}
              color="warning" // Change color to primary
            >
              <ToggleButton value="home">Home</ToggleButton>
              <ToggleButton value="away">Away</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={size}
              exclusive
              onChange={(_, newValue) => setSize(newValue)}
              aria-label="Poop Size"
              fullWidth
              style={{ marginTop: "16px", marginBottom: "8px" }}
              color="info"
            >
              <ToggleButton value="big">Big</ToggleButton>
              <ToggleButton value="small">Small</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={consistency}
              exclusive
              onChange={(_, newValue) => setConsistency(newValue)}
              aria-label="Poop Consistency"
              fullWidth
              style={{ marginBottom: "16px", marginTop: "8px" }}
              color="secondary" // Change color to secondary
            >
              <ToggleButton value="hard">Hard</ToggleButton>
              <ToggleButton value="soft">Soft</ToggleButton>
            </ToggleButtonGroup>
            <Rating
              sx={{ margin: "2rem" }}
              name="rating"
              value={rating}
              onChange={(_, newValue) => setRating(newValue as number)}
              size="large" // Set the size of the stars
            />
            <TextField
              inputProps={{ maxLength: 20 }}
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              style={{ marginTop: "8px" }}
            />
            <Box mt={2}>
              <Button
                disabled={isSubmitPoopDisabled()}
                fullWidth
                variant="outlined"
                color="primary"
                type="submit"
              >
                {isSubmittingPoop ? (
                  <CircularProgress size={24} />
                ) : (
                  "I Pooped!"
                )}
              </Button>
            </Box>
          </form>
        </Box>
      )}
    </div>
  );
};

export default PoopEntryForm;
