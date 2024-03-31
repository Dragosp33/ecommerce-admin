import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { User } from '@/models/User';
import { UserInfo } from '@/models/UserInfo';
import bcrypt from 'bcrypt';
import getServerSession from 'next-auth';
import mongoose from 'mongoose';
import { MongoDBAdapter } from '@auth/mongodb-adapter';

import clientPromise from '@/app/_lib/mongodb';

/*async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function isAdmin() {
  const session = await getServerSession(authConfig);
  const userEmail = session.auth
  if (!userEmail) {
    return false;
  }
  const userInfo = await UserInfo.findOne({ email: userEmail });
  if (!userInfo) {
    return false;
  }
  return userInfo.admin;
}*/

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // adapter: MongoDBAdapter(clientPromise),
  events: {
    async signIn(message) {
      console.log(message, 'this was a message from signin event');
    },
    async signOut(message) {
      console.log(message, 'this was a message from signout event');
    },
    async updateUser(message) {
      console.log(message, 'this was a message from event');
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log(email, password);

          /* const client = await clientPromise;
           const usersCollection = client.db('ecommerce').collection('users');
           const user = await usersCollection.findOne({ email });*/
          if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            const user = await User.findOne({ email });
            console.log(user);
            if (!user) return null;

            const passwordsMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (passwordsMatch) {
              /* const infoCollection = client
                .db('ecommerce')
                .collection('userinfos');

              const userinfo = await infoCollection.findOne({ email });*/
              const userinfo = await UserInfo.findOne({ email });
              //console.log('user info: , ', userinfo);
              if (!userinfo || !userinfo.admin) {
                console.log('no admin');
                return null;
              }
              console.log('userinfo: ', userinfo);
              return {
                email: user.email,
                name: user.name,
                image: user.image,
              };
            }
          }
        }
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
