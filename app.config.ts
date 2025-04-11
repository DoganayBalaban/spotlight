import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Spotlight',
  slug: 'spotlight',
  version: '1.0.0',
  
  extra: {
    clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
    webhookSecret:process.env.CLERK_WEBHOOK_SECRET,
  },
});
