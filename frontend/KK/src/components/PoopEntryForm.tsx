import React, { useState, FormEvent } from "react";
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Rating,
  Stack,
  CircularProgress,
} from "@mui/material";
import { PoopEntry } from "../types/PoopEntry";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { nanoid } from "nanoid";
import { useAuth } from "../App";
import { useQuery, useQueryClient } from "react-query";

enum PoopType {
  RabbitDrops = "Rabbit Drops",
  Bonus = "Bonus",
  Clean = "Clean",
  Dirty = "Dirty",
}

// Enum for consistency
enum PoopConsistency {
  Hard = "Hard",
  Soft = "Soft",
  Watery = "Watery",
}

// Enum for color
enum PoopColor {
  Brown = "Brown",
  Green = "Green",
  Yellow = "Yellow",
}

const PoopEntryForm: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient(); // Access the query client
  const { isLoading, data: poopEntries } = useQuery<PoopEntry[], Error>(
    ["userPoopEntries", currentUser?.uid],
    async () => {
      if (!currentUser) throw new Error("User not authenticated.");
      const userPoopsQuery = query(
        collection(firestore, "poopEntries"),
        where("createdById", "==", currentUser.uid)
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
  const [type, setType] = useState<PoopType | "">("");
  const [consistency, setConsistency] = useState<PoopConsistency | "">("");
  const [color, setColor] = useState<PoopColor | "">("");
  const [notes, setNotes] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [atHome, setAtHome] = useState(false);
  const [rating, setRating] = useState<number>(-1);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (rating === -1) return;
    if (poopEntries) {
      const newPoop: PoopEntry = {
        id: nanoid(),
        number: poopEntries?.length + 1,
        createdById: currentUser?.uid as string,
        createdByName: currentUser?.displayName as string,
        dateTime: Timestamp.now(),
        type,
        consistency,
        color,
        notes,
        comments: [],
        atHome,
        rating,
      };
      await setDoc(doc(firestore, "poopEntries", newPoop.id), newPoop).then(
        () => {
          setShowSuccessToast(true);
          setTimeout(() => {
            queryClient.invalidateQueries("userPoopEntries");
            queryClient.invalidateQueries("poopEntries");
            setShowSuccessToast(false);
          }, 1000);

          setType("");
          setConsistency("");
          setColor("");
          setNotes("");
          setRating(0);
        }
      );
    }
  };

  return (
    <div>
      {isLoading ? (
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
            <Stack direction="row">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={atHome}
                    onChange={(e) => setAtHome(e.target.checked)}
                  />
                }
                label="At Home"
              />
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue as number)}
                precision={0.5} // Allow half-star ratings
                size="large" // Set the size of the stars
              />
            </Stack>
            <TextField
              required
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as PoopType)}
              fullWidth
              margin="normal"
            >
              {Object.values(PoopType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              select
              label="Consistency"
              value={consistency}
              onChange={(e) =>
                setConsistency(e.target.value as PoopConsistency)
              }
              fullWidth
              margin="normal"
            >
              {Object.values(PoopConsistency).map((consistency) => (
                <MenuItem key={consistency} value={consistency}>
                  {consistency}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              select
              label="Color"
              value={color}
              onChange={(e) => setColor(e.target.value as PoopColor)}
              fullWidth
              margin="normal"
            >
              {Object.values(PoopColor).map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
            <Box mt={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
              >
                Add Entry
              </Button>
            </Box>
          </form>
          <Snackbar
            open={showSuccessToast}
            autoHideDuration={3000}
            onClose={() => setShowSuccessToast(false)}
            message="Poop successfully added!"
          />
        </Box>
      )}
    </div>
  );
};

export default PoopEntryForm;
