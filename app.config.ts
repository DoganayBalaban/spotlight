import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Spotlight',
  slug: 'spotlight',
  version: '1.0.0',
  android: {
    package: "com.doganay.spotlight" 
  },
  
  extra: {
    eas: {
      projectId: '7c8cd1db-539f-4cbf-b64f-aa80e4fdad58',
    },
    
    clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
    webhookSecret:process.env.CLERK_WEBHOOK_SECRET,
    
  },
});
