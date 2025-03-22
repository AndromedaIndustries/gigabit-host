import Credentials from "next-auth/providers/credentials";
import { prisma, type User } from "@repo/database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

function saltAndHashPassword(password: string) {
  const envSalt = process.env.AUTH_SALT || 10;

  return bcrypt.hash(password, envSalt);
}

async function getUserFromDb(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}

export default Credentials({
  // You can specify which fields should be submitted, by adding keys to the `credentials` object.
  // e.g. domain, username, password, 2FA token, etc.
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    let user = null;
    const email = credentials.email as string;
    const password = credentials.password as string;

    if (!email) {
      throw new Error("Email is required.");
    }
    if (!password) {
      throw new Error("Password is required.");
    }

    // logic to verify if the user exists
    user = await getUserFromDb(email);
    if (!user) {
      RedirectUserCreation();
      return null;
    }

    if (!user.hashedPassword) {
      throw new Error("Invalid credentials.");
    }

    // logic to verify the password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    // return user object with their profile data
    return user;
  },
});

function RedirectUserCreation() {
  // If the user is created, redirect them to the profile creation page
  return {
    redirect: {
      destination: "/create-account",
      permanent: false,
    },
  };
}
