import React from "react";
import { Typography, Avatar, Box } from "@mui/material";
import { Comment } from "../types/PoopEntry";
import { formatDateTime } from "../utils/formatters";

const CommentSection: React.FC<{ comments: Comment[] }> = ({ comments }) => {
  return (
    <div>
      {comments.map((comment: Comment) => (
        <Box key={comment.id} mb={2} display="flex" alignItems="flex-start">
          {/* Avatar or Profile Picture */}
          <Avatar alt={comment.userName} />

          {/* Comment Content */}
          <Box ml={2}>
            {/* Author Name and Timestamp */}
            <Typography variant="subtitle2" color="textSecondary">
              {comment.userName} • {formatDateTime(comment.dateTime)}
            </Typography>

            {/* Comment Text */}
            <Typography variant="body1">{comment.text}</Typography>
          </Box>
        </Box>
      ))}
    </div>
  );
};

export default CommentSection;
