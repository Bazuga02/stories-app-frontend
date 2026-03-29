import Link from "next/link";

export function StoryNotFound() {
  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 font-login-body">
      <p className="font-headline mb-4 text-2xl font-black text-on-background">Story not found</p>
      <Link href="/" className="font-semibold text-primary underline-offset-2 hover:underline">
        Back to feed
      </Link>
    </main>
  );
}
