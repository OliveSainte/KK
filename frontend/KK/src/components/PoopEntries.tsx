import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Rating,
} from "@mui/material";
import { PoopEntry } from "../types/PoopEntry";
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from "../firebase";
import { formatDateTime } from "../utils/formatters";
import { useAuth } from "../App";
import { useTranslation } from "react-i18next";

const PoopEntries: React.FC = () => {
  const { t } = useTranslation();
  const [poopEntries, setPoopEntries] = useState<PoopEntry[]>([]);
  const [selectedPoops, setSelectedPoops] = useState<PoopEntry[]>([]);
  const [isLoadingPoops, setIsLoadingPoops] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchPoopEntries() {
      try {
        if (currentUser) {
          const userPoopsQuery = query(
            collection(firestore, "poopEntries"),
            where("createdById", "==", currentUser.uid)
          );

          const querySnapshot = await getDocs(userPoopsQuery);
          const entries: PoopEntry[] = [];
          querySnapshot.forEach((doc) => {
            entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
          });

          setPoopEntries(entries);
          setIsLoadingPoops(false);
        } else {
          console.log("User not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching poop entries:", error);
      }
    }
    fetchPoopEntries();
  }, [currentUser]);

  const handlePoopClick = (entry: PoopEntry) => {
    setSelectedPoops((prevSelected) => {
      const index = prevSelected.findIndex((poop) => poop.id === entry.id);
      if (index === -1) {
        // If the poop entry is not already selected, add it to the selected list
        return [...prevSelected, entry];
      } else {
        // If the poop entry is already selected, remove it from the selected list
        const updatedSelected = [...prevSelected];
        updatedSelected.splice(index, 1);
        return updatedSelected;
      }
    });
  };

  return (
    <>
      {isLoadingPoops ? (
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
                    {t("newPoop.noPoops")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            poopEntries.map((entry) => (
              <Grid key={entry.id} item xs={4}>
                <Card
                  sx={{
                    marginBottom: "16px",
                    cursor: "pointer",
                  }}
                  onClick={() => handlePoopClick(entry)}
                >
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {formatDateTime(entry.dateTime)}
                    </Typography>
                  </CardContent>
                  <Divider />
                  {selectedPoops.some((poop) => poop.id === entry.id) && (
                    <CardContent>
                      <Typography variant="body1">
                        {entry.atHome ? "HOME" : "AWAY"}
                      </Typography>
                      <Rating
                        disabled
                        name="rating"
                        value={entry.rating}
                        precision={0.5} // Allow half-star ratings
                        size="medium" // Set the size of the stars
                      />
                      <Typography variant="body1">
                        Type: {entry.type || "Unset"}
                      </Typography>
                      <Typography variant="body1">
                        Consistency: {entry.consistency || "Unset"}
                      </Typography>
                      <Typography variant="body1">
                        Color: {entry.color || "Unset"}
                      </Typography>
                      <Typography variant="body1">
                        Notes: {entry.notes || "Unset"}
                      </Typography>
                    </CardContent>
                  )}
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
