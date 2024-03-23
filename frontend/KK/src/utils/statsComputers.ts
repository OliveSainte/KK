import { PoopEntry } from "../types/PoopEntry";
import { isToday } from "./checkers";

export const calculateLeaderboard = (entries: PoopEntry[]) => {
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

export const displayIcon = (userId: string, poopEntries: PoopEntry[]) => {
  const userStatsThisMonth = getUserStatsThisMonth(poopEntries);
  const userStats = userStatsThisMonth[userId];
  if (!userStats) return null; // No stats available for the user

  const lastPoopEntry = poopEntries
    .filter((entry) => entry.createdByName === userId)
    .sort(
      (a, b) => b.dateTime.toDate().getTime() - a.dateTime.toDate().getTime()
    )[0];

  if (!lastPoopEntry) {
    // No poop entry found for the user
    return "❄️"; // Snowflake icon
  }

  if (lastPoopEntry.isFire && isToday(lastPoopEntry.dateTime.toDate())) {
    // Last poop entry is classified as fire
    return "🔥"; // Fire icon
  } else if (lastPoopEntry.isIce) {
    // Last poop entry is classified as ice
    return "❄️"; // Snowflake icon
  } else {
    return null; // No significant event for the user
  }
};

export const getUserStatsThisMonth = (poopEntries: PoopEntry[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const userStats: Record<string, { count: number; averagePerDay: number }> =
    {};

  // Initialize userStats with all users
  calculateLeaderboard(poopEntries).forEach(([userId]) => {
    userStats[userId] = { count: 0, averagePerDay: 0 };
  });

  // Iterate through poopEntries to calculate stats for each user
  poopEntries.forEach((entry) => {
    const entryDate = entry.dateTime.toDate();
    if (
      entryDate.getMonth() === currentMonth &&
      entryDate.getFullYear() === currentYear
    ) {
      userStats[entry.createdByName].count += 1;
    }
  });

  // Calculate average per day for each user
  Object.keys(userStats).forEach((userId) => {
    userStats[userId].averagePerDay =
      userStats[userId].count / new Date().getDate();
  });
  return userStats;
};
