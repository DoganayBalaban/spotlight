import { View, Text, Image } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.style";
import { formatDistanceToNow } from "date-fns";
interface Comment {
  comment: string;
  _creationTime: number;
  user: {
    username: string;
    image: string;
  };
}

export default function Comment({ comment }: { comment: Comment }) {
  return (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user.image }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.username}</Text>
        <Text style={styles.commentText}>{comment.comment}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, {
            addSuffix: true,
          })}
        </Text>
      </View>
    </View>
  );
}
