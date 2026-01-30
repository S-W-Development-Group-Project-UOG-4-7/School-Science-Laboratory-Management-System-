import NextAuth from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      teacherId?: number;
      labAssistantId?: number;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    role: string;
    teacherId?: number;
    labAssistantId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    teacherId?: number;
    labAssistantId?: number;
  }
}