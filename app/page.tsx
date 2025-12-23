import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center pt-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Welcome to VT Craft
        </h1>
        <p>Virginia Tech's two week minecraft phase!</p>
      </div>
      <div className="pt-4">
        <Link href="/sendV">
          <button className="text-black bg-amber-50 px-5 py-2">Play</button>
        </Link>
      </div>
    </div>
  );
}
