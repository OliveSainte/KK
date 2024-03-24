import React, { useState } from "react";
import { CircularProgress, Grid, Tab, Tabs } from "@mui/material";
import { PoopEntry } from "../types/PoopEntry";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase";
import { useQuery } from "react-query";
import PoopStats from "./PoopStats";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PoopEntryCard from "./PoopEntryCard";

const Home: React.FC = () => {
  const { isLoading, data: poopEntries } = useQuery<PoopEntry[], Error>(
    ["poopEntries"],
    async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(firestore, "poopEntries"),
            orderBy("dateTime", "desc")
          )
        );

        const entries: PoopEntry[] = [];

        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
        });

        return entries;
      } catch (error) {
        console.error("Error fetching poop entries:", error);
        throw new Error("Failed to fetch poop entries");
      }
    },
    {
      staleTime: 60000,
    }
  );
  const [tabValue, setTabValue] = useState<number>(0); // State for controlling tabs

  return (
    <div style={{ width: "100%", minHeight: "90vh" }}>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Tabs
            sx={{ marginBottom: "1rem" }}
            variant="fullWidth"
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
          >
            <Tab icon={<DynamicFeedIcon />} label="" />
            <Tab icon={<EmojiEventsIcon />} label="" />
          </Tabs>
          {tabValue === 0 ? (
            <div style={{ marginBottom: "4rem" }}>
              <Grid container spacing={2}>
                {poopEntries?.map((entry) => (
                  <Grid key={entry.id} item xs={12} sm={6} md={4}>
                    <PoopEntryCard entry={entry} />
                  </Grid>
                ))}
              </Grid>
            </div>
          ) : (
            <PoopStats />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
