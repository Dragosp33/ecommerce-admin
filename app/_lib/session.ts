'use server';

import { cookies } from 'next/headers';

export async function deleteSession() {
  const cookie_name =
    process.env.NODE_ENV == 'production'
      ? '__Secure-authjs.session-token'
      : `authjs.session-token`;

  // Set the cookie with Max-Age to 0 to delete it
  cookies().set(cookie_name, '', {
    path: '/',
    maxAge: 0, // Deletes the cookie
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    domain:
      process.env.NODE_ENV === 'production'
        ? '.shop.dragospolifronie.com'
        : '.shop.localhost',
  });

  // Return a simple status
  return { success: true };
}
