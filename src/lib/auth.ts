import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { schema } from '@/db/schema';
import ForgotPasswordEmail from '@/components/emails/reset-password';
import { Resend } from 'resend';
import VerifyEmail from '@/components/emails/verify-email';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      resend.emails.send({
        // from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        from: 'admin@roblesdiaz.es',
        to: user.email,
        subject: 'Verify your email',
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        // from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        from: 'admin@roblesdiaz.es',
        to: user.email,
        subject: 'Reset your password',
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email,
        }),
      });
    },
    // requireEmailVerification: true,
  },
  plugins: [nextCookies()], // make sure this is the last plugin in the array
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
