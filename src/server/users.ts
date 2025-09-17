'use server';

import { db } from '@/db/drizzle';
import { user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

interface FormState {
  success: boolean;
  message: string;
}

export const signIn = async (prevState: FormState, formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    return {
      success: true,
      message: 'Signed in successfully.',
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || 'An unknown error occurred.',
    };
  }
};

export const signUp = async (prevState: FormState, formData: FormData) => {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
      },
    });
    return {
      success: true,
      message: 'Signed up successfully.',
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || 'An unknown error occurred.',
    };
  }
};

export async function searchAccount(email: string) {
  const userfound = await db.select().from(user).where(eq(user.email, email));
  return userfound;
}
