// src/app/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function normalizeRole(role: Role) {
  switch (role) {
    case "TEACHER":
      return "teacher";
    case "LAB_ASSISTANT":
      // Use underscore form for consistency across API and client
      return "lab_assistant";
    case "PRINCIPAL":
      return "principal";
    case "ADMIN":
      return "admin";
    case "STUDENT":
      return "student";
    default:
      return "student";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { teacher: true, labAssistant: true },
        });

        if (!user) return null;

        const passwordValid =
          process.env.NODE_ENV === "development"
            ? user.password === credentials.password ||
              (await bcrypt.compare(credentials.password, user.password))
            : await bcrypt.compare(credentials.password, user.password);

        if (!passwordValid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,

          // ✅ store normalized role for frontend + API checks
          role: normalizeRole(user.role),

          // ✅ store ids
          teacherId: user.teacher?.id ?? undefined,
          labAssistantId: user.labAssistant?.id ?? undefined,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role; // normalized
        token.teacherId = (user as any).teacherId;
        token.labAssistantId = (user as any).labAssistantId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role; // normalized
        (session.user as any).teacherId = token.teacherId;
        (session.user as any).labAssistantId = token.labAssistantId;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};