import React, { useMemo } from "react";
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
  Stack,
} from "@mui/material";
import { formatDateTime } from "../utils/formatters";
import { useQuery } from "react-query";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase";
import { PoopEntry } from "../types/PoopEntry";
import { useAuth } from "../App";
import {
  calculateLeaderboard,
  displayIcon,
  getUserStatsThisMonth,
} from "../utils/statsComputers";
import { isToday } from "../utils/checkers";
import { brown } from "../../public/colors";
import { MilitaryTech } from "@mui/icons-material";

const PoopStats: React.FC = () => {
  const { currentUser } = useAuth();
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

  const leaderboard = useMemo(
    () =>
      calculateLeaderboard(poopEntries).sort(
        (a, b) => b[1] - a[1] // Sort by poop count, descending
      ),
    [poopEntries]
  );

  // Get the most recent 3 entries
  const recentEntries = poopEntries.slice(0, 3).map((entry) => {
    return {
      user: entry.createdByName,
      dateTime: formatDateTime(entry.dateTime),
      number: entry.number,
    };
  });

  const computeMyAverage = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const userEntries = poopEntries.filter(
      (entry) =>
        entry.createdById === currentUser?.uid &&
        entry.dateTime.toDate().getMonth() === currentMonth
    );
    const myTotal = userEntries.length;
    return myTotal / now.getDate(); // Assuming now.getDate() gives the elapsed days in the month
  }, [poopEntries, currentUser]);

  const userStatsThisMonth = useMemo(
    () => getUserStatsThisMonth(poopEntries),
    [poopEntries]
  );

  const averagePoopsPerUserThisMonth = useMemo(() => {
    const totalPoopsThisMonth = Object.values(userStatsThisMonth).reduce(
      (acc, userStat) => acc + userStat.count,
      0
    );
    const userCountThisMonth = Object.keys(userStatsThisMonth).length;
    return userCountThisMonth !== 0
      ? totalPoopsThisMonth / userCountThisMonth
      : 0;
  }, [userStatsThisMonth]);

  // Calculate total entries and average poops per user
  const totalEntries = poopEntries.length || 0;
  const userCount = Object.keys(calculateLeaderboard(poopEntries)).length;
  const averagePoopsPerUser = userCount !== 0 ? totalEntries / userCount : 0;

  const getTodaysStats = () => {
    if (leaderboard) {
      const leaderCopy = [...leaderboard];
      return leaderCopy.sort(
        (a, b) =>
          poopEntries.filter(
            (entry) =>
              entry.createdByName === b[0] && isToday(entry.dateTime.toDate())
          ).length -
          poopEntries.filter(
            (entry) =>
              entry.createdByName === a[0] && isToday(entry.dateTime.toDate())
          ).length
      );
    } else return [];
  };
  const todaysStats = useMemo(() => getTodaysStats(), []);

  return (
    <div style={{ marginBottom: "4rem" }}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={6}
              style={{
                padding: 20,
                borderLeft: `6px solid ${brown}`,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                style={{ marginBottom: "1rem" }}
              >
                This month you pooped around
                <Chip
                  variant="outlined"
                  label={`${computeMyAverage.toFixed(2)}`}
                  style={{
                    marginLeft: "0.5rem",
                    borderColor: brown,
                  }}
                />{" "}
                times each day.
              </Typography>
              <Typography variant="body1">
                {computeMyAverage < 1
                  ? " Make sure you stay hydrated!"
                  : "Keep going!"}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={3} style={{ padding: 20 }}>
              <Typography variant="h6" gutterBottom>
                Today
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Poops</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todaysStats.map(([userId]) => (
                      <TableRow key={userId}>
                        <TableCell>{userId}</TableCell>
                        <TableCell>
                          {
                            poopEntries.filter(
                              (entry) =>
                                entry.createdByName === userId &&
                                isToday(entry.dateTime.toDate())
                            ).length
                          }
                        </TableCell>
                        <TableCell>
                          {displayIcon(userId, poopEntries)}
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
                Latest
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>#</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.user}</TableCell>
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
            <Paper
              elevation={3}
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
              }}
            >
              <Typography variant="h6" gutterBottom>
                This Month
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Poops</TableCell>
                      <TableCell>Per Day</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map(([userId]) => (
                      <TableRow key={userId}>
                        <TableCell>{userId}</TableCell>
                        <TableCell>
                          {userStatsThisMonth[userId]?.count || 0}
                        </TableCell>
                        <TableCell>
                          {userStatsThisMonth[userId]?.averagePerDay.toFixed(
                            2
                          ) || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" justifyContent="end">
                <Chip
                  sx={{ margin: "1rem" }}
                  variant="outlined"
                  label={`${averagePoopsPerUserThisMonth.toFixed(2)} / user`}
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6">
                        All Time
                        <MilitaryTech
                          fontSize="small"
                          style={{
                            verticalAlign: "middle",
                            marginRight: "0.5rem",
                          }}
                        />
                      </Typography>
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
              <Stack direction="row" justifyContent="end">
                <Chip
                  sx={{ margin: "1rem" }}
                  variant="outlined"
                  label={`${totalEntries} total`}
                />
                <Chip
                  sx={{ margin: "1rem" }}
                  variant="outlined"
                  label={`${averagePoopsPerUser.toFixed(2)} / user`}
                />
              </Stack>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default PoopStats;
