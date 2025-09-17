import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-5 items-center justify-center h-screen px-5 text-center">
        <Image
          src="/better-auth-starter.png"
          alt="Better Auth"
          width={100}
          height={100}
          className="rounded-lg dark:invert"
        />
        <h1 className="text-4xl font-bold">Better Auth Starter</h1>
        <p className="text-lg">
          This is a starter project that uses Better Auth to authenticate users.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
