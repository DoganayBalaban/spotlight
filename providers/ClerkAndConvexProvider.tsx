import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/dist/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";

const publishableKey = Constants.expoConfig?.extra?.clerkKey;
const convexUrl = Constants.expoConfig?.extra?.convexUrl;

if (!publishableKey || !convexUrl) {
  throw new Error("Missing Clerk or Convex environment variables");
}
const convex = new ConvexReactClient(convexUrl);

export default function ClerkAndConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>{children}</ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
