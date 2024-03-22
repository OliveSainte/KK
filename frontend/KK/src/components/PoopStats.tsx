import React from "react";
import {
  CircularProgress,
  Typography,
  Grid,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { formatDateTime } from "../utils/formatters";
import { useQuery } from "react-query";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase";
import { PoopEntry } from "../types/PoopEntry";
import { isToday } from "../utils/checkers";

const PoopStats: React.FC = () => {
  const { isLoading, data: poopEntries = [] } = useQuery<PoopEntry[], Error>(
    ["poopEntries"],
    async () => {
      const querySnapshot = await getDocs(
        query(collection(firestore, "poopEntries"), orderBy("dateTime"))
      );

      const entries: PoopEntry[] = [];

      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
      });

      return entries;
    },
    {
      staleTime: 120000, // One minute stale time
    }
  );

  const calculateLeaderboard = (entries: PoopEntry[]) => {
    const userPoopCounts: Record<string, number> = {};

    // Count poop entries for each user
    entries.forEach((entry) => {
      const userId = entry.createdByName;
      userPoopCounts[userId] = (userPoopCounts[userId] || 0) + 1;
    });

    // Sort users by poop count
    const sortedUsers = Object.entries(userPoopCounts).sort(
      ([, countA], [, countB]) => countB - countA
    );

    return sortedUsers;
  };

  const leaderboard = calculateLeaderboard(poopEntries);

  // Get the most recent 3 entries
  const recentEntries = poopEntries.slice(-3).map((entry) => {
    return {
      user: entry.createdByName,
      dateTime: formatDateTime(entry.dateTime),
      number: entry.number,
    };
  });

  return (
    <div>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6">Leaderboard</Typography>
                    </TableCell>
                    <TableCell align="right">Poops</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map(([userId, count]) => (
                    <TableRow key={userId}>
                      <TableCell component="th" scope="row">
                        {userId}
                      </TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">
                        {poopEntries.some(
                          (entry) =>
                            entry.createdByName === userId &&
                            isToday(entry.dateTime.toDate())
                        ) ? (
                          <span style={{ color: "green" }}>▲</span>
                        ) : (
                          <span style={{ color: "red" }}>▼</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: 20 }}>
              <Typography variant="h6" gutterBottom>
                Latest Entries
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>#</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.user}</TableCell>
                        <TableCell>{entry.dateTime}</TableCell>
                        <TableCell>
                          <Chip size="small" label={entry.number} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={3} style={{ padding: 20 }}>
              <Typography variant="h6" gutterBottom>
                Total Entries
              </Typography>
              <Typography variant="body1">
                {poopEntries?.length || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default PoopStats;
