import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

// Custom Figma Provider
const FigmaProvider = {
  id: "figma",
  name: "Figma",
  type: "oauth" as const,
  authorization: "https://www.figma.com/oauth?scope=file_read&response_type=code",
  token: "https://api.figma.com/v1/oauth/token",
  userinfo: "https://api.figma.com/v1/me",
  clientId: process.env.FIGMA_CLIENT_ID!,
  clientSecret: process.env.FIGMA_CLIENT_SECRET!,
  profile(profile: {
    id: string;
    handle: string;
    email: string;
    img_url: string;
  }) {
    return {
      id: profile.id,
      name: profile.handle,
      email: profile.email,
      image: profile.img_url,
    };
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [FigmaProvider],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // Log new user creation
      console.log(`New user created: ${user.email}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
});

// Helper to get current session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Helper to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
