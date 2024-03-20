import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  Rating,
  CircularProgress,
} from "@mui/material";
import { PoopEntry, Comment } from "../types/PoopEntry";
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { formatDateTime } from "../utils/formatters";
import { useAuth } from "../App";
import { nanoid } from "nanoid";

const Home: React.FC = () => {
  const [poopEntries, setPoopEntries] = useState<PoopEntry[]>([]);
  const [commentText, setCommentText] = useState<string>(""); // State to hold comment text
  const { currentUser } = useAuth(); // Get the current user from the AuthContext
  const [expandedComments, setExpandedComments] = useState<{
    [key: string]: boolean;
  }>({}); // State to manage expanded comments for each poop entry
  const [loading, setLoading] = useState(true); // State for loading indicator

  useEffect(() => {
    async function fetchPoopEntries() {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(firestore, "poopEntries"),
            where("createdById", "!=", currentUser?.uid),
            orderBy("dateTime", "desc") // Sort entries by dateTime in descending order
          )
        );

        const entries: PoopEntry[] = [];

        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
        });

        setPoopEntries(entries);
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error("Error fetching poop entries:", error);
      }
    }

    fetchPoopEntries();
  }, [currentUser]);

  // Function to handle comment submission
  const handleCommentSubmit = async (entryId: string) => {
    try {
      const entryDocRef = doc(firestore, "poopEntries", entryId);
      const entryDocSnap = await getDoc(entryDocRef);
      const newComment: Comment = {
        id: nanoid(),
        userId: currentUser?.uid || "",
        userName: currentUser?.displayName || "Anonymous",
        text: commentText,
      };
      if (entryDocSnap.exists()) {
        const currentComments = entryDocSnap.data().comments || [];
        const updatedComments = [...currentComments, newComment];
        await updateDoc(entryDocRef, { comments: updatedComments });

        setPoopEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === entryId
              ? { ...entry, comments: updatedComments }
              : entry
          )
        );

        // Reset the comment text after submission
        setCommentText("");
      } else {
        console.error("Poop entry document does not exist");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Function to toggle expanded comments for a poop entry
  const toggleComments = (entryId: string) => {
    setExpandedComments((prevExpanded) => ({
      ...prevExpanded,
      [entryId]: !prevExpanded[entryId],
    }));
  };

  return (
    <div>
      {loading ? (
        <CircularProgress /> // Display circular progress while loading
      ) : (
        <>
          {poopEntries.map((entry) => (
            <Card key={entry.id} style={{ marginBottom: "16px" }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {entry.createdByName}
                  <Rating
                    disabled
                    sx={{ marginLeft: "1rem" }}
                    name="rating"
                    value={entry.rating}
                    precision={0.5} // Allow half-star ratings
                    size="medium" // Set the size of the stars
                  />
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {formatDateTime(entry.dateTime)}
                </Typography>
                <Divider />
                {entry.notes && (
                  <Typography variant="body1">
                    Notes: {entry.notes || "Unset"}
                  </Typography>
                )}
                {/* Toggle button to show/hide comments */}
                <Button
                  color="primary"
                  onClick={() => toggleComments(entry.id)}
                >
                  {expandedComments[entry.id]
                    ? "Hide Comments"
                    : "Show Comments"}
                </Button>
                {/* Display comments if expandedComments for this entry is true */}
                {expandedComments[entry.id] && (
                  <div>
                    {entry.comments &&
                      entry.comments.map((comment: Comment) => (
                        <div key={comment.id}>
                          <Typography variant="body2">
                            <strong>{comment.userName}: </strong>
                            {comment.text}
                          </Typography>
                        </div>
                      ))}
                    {/* Form to input comment */}
                    <TextField
                      label="Add a comment"
                      variant="outlined"
                      fullWidth
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ marginTop: "16px" }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCommentSubmit(entry.id)}
                      style={{ marginTop: "8px" }}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default Home;
