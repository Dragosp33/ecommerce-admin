'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const clearCachesByServerAction = async (
  path?: string,
  redirectToPath?: boolean
) => {
  try {
    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath('/');
    }
  } catch (error) {
    console.error('clearCachesByServerAction=> ', error);
  }
};
export default clearCachesByServerAction;
