import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PoopEntry } from "../types/PoopEntry";
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "../App";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import PoopEntryCard from "./PoopEntryCard";

const PoopEntries: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  // Use useQuery to fetch poop entries
  const {
    isLoading,
    data: poopEntries,
    error,
  } = useQuery<PoopEntry[], Error>(
    ["userPoopEntries", currentUser?.uid],
    async () => {
      if (!currentUser) throw new Error("User not authenticated.");
      const userPoopsQuery = query(
        collection(firestore, "poopEntries"),
        orderBy("dateTime", "desc"),
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

  return (
    <div style={{ width: "100%", minHeight: "90vh", marginBottom: "4rem" }}>
      {isLoading ? ( // Show loading indicator
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : error ? ( // Show error message if there's an error
        <Typography color="error">{error.message}</Typography>
      ) : (
        <Grid container spacing={2}>
          {poopEntries?.length === 0 ? ( // Show message if there are no poop entries
            <Grid item xs={12}>
              <Card sx={{ marginBottom: "16px" }}>
                <CardContent>
                  <Typography variant="h5" component="h2" textAlign="center">
                    {t("newPoop.noPoops")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            poopEntries?.map((entry) => (
              <Grid key={entry.id} item xs={12} sm={6} md={4}>
                <PoopEntryCard entry={entry} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </div>
  );
};

export default PoopEntries;
