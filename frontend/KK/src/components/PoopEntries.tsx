import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { PoopEntry } from "../types/PoopEntry";
import { getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase";
import { formatDateTime } from "../utils/formatters";

const PoopEntries: React.FC = () => {
  const [poopEntries, setPoopEntries] = useState<PoopEntry[]>([]);
  const [isLoadingPoops, setIsLoadingPoops] = useState(true); // Initialize loading state as true

  useEffect(() => {
    async function fetchPoopEntries() {
      try {
        // Query the 'poopEntries' collection in Firestore
        const querySnapshot = await getDocs(
          collection(firestore, "poopEntries")
        );
        const entries: PoopEntry[] = [];
        querySnapshot.forEach((doc) => {
          // Extract data from each document and push it to the 'entries' array
          entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
        });
        // Set the state with the fetched poop entries
        setPoopEntries(entries);
        setIsLoadingPoops(false); // Set loading state to false after fetching
      } catch (error) {
        console.error("Error fetching poop entries:", error);
      }
    }
    fetchPoopEntries();
  }, []);

  return (
    <>
      {isLoadingPoops ? ( // Conditionally render spinner while loading
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={2} textAlign="center">
          {poopEntries.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ marginBottom: "16px" }}>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    No poops available. Add a new poop entry!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            poopEntries.map((entry) => (
              <Grid key={entry.id} item xs={4}>
                <Card sx={{ marginBottom: "16px" }}>
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      {formatDateTime(entry.dateTime)}
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        color: "text.secondary",
                        marginBottom: "8px",
                      }}
                    >
                      {entry.createdByName || "Unset"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        color: "text.secondary",
                        marginBottom: "8px",
                      }}
                    >
                      Type: {entry.type || "Unset"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        color: "text.secondary",
                        marginBottom: "8px",
                      }}
                    >
                      Consistency: {entry.consistency || "Unset"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        color: "text.secondary",
                        marginBottom: "8px",
                      }}
                    >
                      Color: {entry.color || "Unset"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        color: "text.secondary",
                        marginBottom: "8px",
                      }}
                    >
                      Notes: {entry.notes || "Unset"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </>
  );
};

export default PoopEntries;
