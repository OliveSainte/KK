import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Rating,
  Chip,
  Stack,
  CardHeader,
  Avatar,
  Badge,
  IconButton,
} from "@mui/material";
import { PoopEntry, Comment } from "../types/PoopEntry";
import { updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { formatDateTime } from "../utils/formatters";
import { useAuth } from "../App";
import { nanoid } from "nanoid";
import { useQueryClient } from "react-query";
import CommentSection from "./CommentSection";
import { brown } from "../../public/colors";
import SendIcon from "@mui/icons-material/Send";
import useUserProfile from "../queries/useUserProfile";

interface PoopEntryProps {
  entry: PoopEntry;
}

const PoopEntryCard: React.FC<PoopEntryProps> = ({ entry }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState<string>("");
  const [expandedComments, setExpandedComments] = useState<boolean>(false);

  const { profile } = useUserProfile(currentUser?.uid);

  const handleCommentSubmit = async () => {
    try {
      const entryDocRef = doc(firestore, "poopEntries", entry.id);
      const entryDocSnap = await getDoc(entryDocRef);
      const newComment: Comment = {
        id: nanoid(),
        userId: currentUser?.uid || "",
        userName: profile?.username || "Anonymous",
        userProfilePic: profile?.profilePicUrl ?? "/KK.svg",
        text: commentText.trim(),
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
    if (count === 0) return "";
    else if (count <= 5) return `${count}`;
    else return `${5}+`;
  };

  return (
    <Card
      raised
      onClick={toggleComments}
      sx={{ cursor: "pointer", borderLeft: `6px solid ${brown}` }}
    >
      <CardHeader
        avatar={
          <Badge
            badgeContent={entry.number} // Display the poop number as badge content
            anchorOrigin={{ vertical: "top", horizontal: "left" }} // Adjust badge position
          >
            <Avatar
              alt="/KK.svg"
              src={entry.userProfilePic}
              srcSet={entry.userProfilePic}
            />
          </Badge>
        }
        title={
          <>
            <Typography variant="body1" component="div">
              {entry.createdByName}
              {entry.isFire ? "🔥" : ""} {entry.isIce ? "❄️" : ""}
              {entry.comments.length > 0 && (
                <Chip
                  size="small"
                  sx={{ float: "right" }}
                  label={formatCommentCount(entry.comments.length)}
                />
              )}
            </Typography>
          </>
        }
        subheader={
          <Typography color="textSecondary" fontSize="small">
            {formatDateTime(entry.dateTime)}
          </Typography>
        }
      />
      {expandedComments && (
        <CardContent>
          <Stack
            display="flex"
            direction="row"
            justifyContent="space-between"
            marginBottom="1rem"
            alignContent="center"
          >
            <Chip color="warning" variant="outlined" label={entry.location} />
            <Chip color="info" variant="outlined" label={entry.size} />
            <Chip
              color="secondary"
              variant="outlined"
              label={entry.consistency}
            />
            <Rating disabled name="rating" value={entry.rating} size="small" />
          </Stack>

          {entry.comments && <CommentSection comments={entry.comments} />}
          <TextField
            onClick={(e) => e.stopPropagation()}
            label="Add a comment"
            inputProps={{ maxLength: 20 }}
            variant="outlined"
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{ marginTop: "16px" }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={(e) => {
                    handleCommentSubmit();
                    e.stopPropagation();
                  }}
                  disabled={commentText.length < 1}
                >
                  <SendIcon />
                </IconButton>
              ),
            }}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default PoopEntryCard;
