import { signOutAction } from '@/app/_lib/actions';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  console.log(request);
  const cookies = request.cookies;
  console.log({ cookies });
  const csrfTokenCookie = cookies.get('authjs.csrf-token');

  //await signOutAction(cookies.toString());

  //return Response.json(featProduct);
  //const csrfToken = cookies.get('authjs.csrf-token') || 'fallback_csrf_token';
  console.log('authjs.csrf: ', csrfTokenCookie);
  /*const res = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/signout`,
    {
      method: 'POST',
      credentials: 'include', // This includes cookies in the request
      body: JSON.stringify({
        csrfToken: csrfTokenCookie?.value, // Send the CSRF token in the body
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: Object.entries(cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; '),
      },
    }
  );
*/

  const csrf = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/csrf`,
    {
      method: 'GET',
    }
  );

  const csrfToken = await csrf.json();
  console.log('csrftoken from /csrf: ', csrfToken);

  const body = JSON.stringify(csrfToken);

  const body2 = JSON.stringify({
    csrfToken: csrfTokenCookie?.value,
  });
  console.log('body 1: ', body, 'body2: ', body2);
  await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/signout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body2,
  });

  //const textResponse = await res.text(); // Get raw text response
  //console.log('Raw response:', textResponse);
  return Response.json({ message: 'logged out?' });
}
