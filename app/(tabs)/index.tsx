import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.style";
import { useAuth } from "@clerk/clerk-react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import Post from "../../components/Post";
import Loader from "@/components/Loader";

const Index = () => {
  const { signOut } = useAuth();
  const posts = useQuery(api.posts.getFeedPosts);
  if (posts === undefined) return <Loader />;
  if (posts.length === 0) return <NoPostFound />;
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      {/* STORY */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        ListHeaderComponent={<StoriesSection />}
      />
    </View>
  );
};

export default Index;

const StoriesSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
    >
      {STORIES.map((story) => {
        return <Story key={story.id} story={story} />;
      })}
    </ScrollView>
  );
};

const NoPostFound = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.background,
    }}
  >
    <Text
      style={{
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: "bold",
      }}
    >
      No posts found
    </Text>
  </View>
);
