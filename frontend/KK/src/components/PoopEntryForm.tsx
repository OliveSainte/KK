import React, { useState, FormEvent } from "react";
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Typography,
  MenuItem,
} from "@mui/material";
import { PoopEntry } from "../types/PoopEntry";
import { useNavigate } from "react-router-dom";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { nanoid } from "nanoid";
import { useAuth } from "../App";

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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [type, setType] = useState<PoopType | "">("");
  const [consistency, setConsistency] = useState<PoopConsistency | "">("");
  const [color, setColor] = useState<PoopColor | "">("");
  const [notes, setNotes] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const newPoop: PoopEntry = {
      id: nanoid(),
      createdById: currentUser?.uid as string,
      createdByName: currentUser?.displayName as string,
      dateTime: Timestamp.now(),
      type,
      consistency,
      color,
      notes,
    };
    await setDoc(doc(firestore, "poopEntries", newPoop.id), newPoop).then(
      () => {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigate("/see-poops");
        }, 1000);

        setType("");
        setConsistency("");
        setColor("");
        setNotes("");
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "80%", maxWidth: "400px" }}>
        <Typography variant="h4" gutterBottom align="center">
          Pooped?
        </Typography>
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
          onChange={(e) => setConsistency(e.target.value as PoopConsistency)}
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
          <Button fullWidth variant="contained" color="primary" type="submit">
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
  );
};

export default PoopEntryForm;
