import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  Rating,
  Chip,
} from "@mui/material";
import { PoopEntry, Comment } from "../types/PoopEntry";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { formatDateTime } from "../utils/formatters";
import { useAuth } from "../App";
import { nanoid } from "nanoid";
import { useQueryClient } from "react-query";

interface PoopEntryProps {
  entry: PoopEntry;
}

const PoopEntryCard: React.FC<PoopEntryProps> = ({ entry }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState<string>("");
  const [expandedComments, setExpandedComments] = useState<boolean>(false);

  const handleCommentSubmit = async () => {
    if (commentText.length >= 50) return;
    try {
      const entryDocRef = doc(firestore, "poopEntries", entry.id);
      const entryDocSnap = await getDoc(entryDocRef);
      const newComment: Comment = {
        id: nanoid(),
        userId: currentUser?.uid || "",
        userName: currentUser?.displayName || "Anonymous",
        text: commentText,
      };
      if (entryDocSnap.exists()) {
        const currentComments = entryDocSnap.data()?.comments || [];
        const updatedComments = [...currentComments, newComment];
        await updateDoc(entryDocRef, { comments: updatedComments });
        queryClient.setQueryData<PoopEntry[]>(["poopEntries"], (oldData) => {
          const updatedData = oldData?.map((item) => {
            if (item.id === entry.id) {
              return {
                ...item,
                comments: updatedComments,
              };
            }
            return item;
          });
          return updatedData || [];
        });
        setCommentText("");
      } else {
        console.error("Poop entry document does not exist");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = () => {
    setExpandedComments((prevExpanded) => !prevExpanded);
  };

  const formatCommentCount = (count: number): string => {
    if (count === 0) return "0";
    else if (count <= 5) return `${count}`;
    else return `${5}+`;
  };

  return (
    <Card onClick={toggleComments} style={{ cursor: "pointer" }}>
      <CardContent>
        <Typography variant="subtitle2" component="div">
          <Chip label={entry.number} sx={{ marginRight: "0.5rem" }} />
          {entry.createdByName} {entry.atHome ? "HOME" : "AWAY"}
          <Rating
            disabled
            sx={{ marginLeft: "1rem" }}
            name="rating"
            value={entry.rating}
            precision={0.5}
            size="medium"
          />
          {entry.comments?.length > 0 && (
            <Chip
              size="small"
              color="primary"
              sx={{ float: "right" }}
              label={formatCommentCount(entry.comments.length)}
            ></Chip>
          )}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {formatDateTime(entry.dateTime)}
        </Typography>
        {expandedComments && (
          <div>
            <Divider />
            <Typography>
              {entry.color}-{entry.consistency}-{entry.type}
            </Typography>
            {entry.notes && (
              <Typography variant="body1">
                Notes: {entry.notes || "Unset"}
              </Typography>
            )}
            {entry.comments &&
              entry.comments.map((comment: Comment) => (
                <div key={comment.id}>
                  <Typography variant="body2">
                    <strong>{comment.userName}: </strong>
                    {comment.text}
                  </Typography>
                </div>
              ))}
            <TextField
              onClick={(e) => e.stopPropagation()}
              label="Add a comment"
              inputProps={{ maxLength: 40 }}
              variant="outlined"
              fullWidth
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ marginTop: "16px" }}
            />
            <Button
              fullWidth
              color="primary"
              onClick={(e) => {
                handleCommentSubmit();
                e.stopPropagation();
              }}
              style={{ marginTop: "8px" }}
            >
              Comment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoopEntryCard;
