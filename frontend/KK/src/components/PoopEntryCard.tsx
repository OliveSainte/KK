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
  Stack,
} from "@mui/material";
import { PoopEntry, Comment } from "../types/PoopEntry";
import { updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { formatDateTime } from "../utils/formatters";
import { useAuth } from "../App";
import { nanoid } from "nanoid";
import { useQueryClient } from "react-query";
import CommentSection from "./CommentSection";

interface PoopEntryProps {
  entry: PoopEntry;
}

const PoopEntryCard: React.FC<PoopEntryProps> = ({ entry }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState<string>("");
  const [expandedComments, setExpandedComments] = useState<boolean>(false);

  const handleCommentSubmit = async () => {
    try {
      const entryDocRef = doc(firestore, "poopEntries", entry.id);
      const entryDocSnap = await getDoc(entryDocRef);
      const newComment: Comment = {
        id: nanoid(),
        userId: currentUser?.uid || "",
        userName: currentUser?.displayName || "Anonymous",
        text: commentText,
        dateTime: Timestamp.now(),
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
        queryClient.setQueryData<PoopEntry[]>(
          ["userPoopEntries", currentUser?.uid],
          (oldData) => {
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
          }
        );
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
        <Typography variant="body1" component="div">
          <Chip
            label={entry.number}
            size="small"
            sx={{ marginRight: "0.5rem" }}
          />
          {entry.createdByName} {entry.isFire ? "🔥" : ""}{" "}
          {entry.isIce ? "❄️" : ""}
          <Rating
            disabled
            sx={{ marginLeft: "1rem" }}
            name="rating"
            value={entry.rating}
            size="small"
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
        <Typography color="textSecondary" fontSize="small">
          {formatDateTime(entry.dateTime)}
        </Typography>
        {expandedComments && (
          <div>
            <Divider sx={{ marginTop: "0.5rem", marginBottom: "0.5rem" }} />

            <Stack
              direction="row"
              justifyContent="space-between"
              marginY="1rem"
            >
              <Chip color="warning" variant="outlined" label={entry.location} />
              <Chip color="primary" variant="outlined" label={entry.size} />
              <Chip
                color="secondary"
                variant="outlined"
                label={entry.consistency}
              />
            </Stack>

            {entry.comments && <CommentSection comments={entry.comments} />}
            <TextField
              onClick={(e) => e.stopPropagation()}
              label="Add a comment"
              inputProps={{ maxLength: 30 }}
              variant="outlined"
              fullWidth
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ marginTop: "16px" }}
            />
            <Button
              disabled={commentText.length <= 0}
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
