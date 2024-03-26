import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../App";
import { useTranslation } from "react-i18next";
import PoopEntryCard from "./PoopEntryCard";
import useUserPoopEntries from "../queries/useUserPoopEntries";

const PoopEntries: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  // Use useQuery to fetch poop entries
  const { isLoading, poopEntries, error } = useUserPoopEntries(
    currentUser?.uid
  );

  return (
    <div style={{ width: "100%", minHeight: "40vh" }}>
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
