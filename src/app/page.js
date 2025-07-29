"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); 
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-gradient-to-br from-indigo-600 to-indigo-800">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-xl text-center max-w-xl w-full">
        <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
          Habit Tracker
        </h1>
        <p className="text-indigo-100 text-lg mb-8">
          Build better habits, track your growth, and stay consistent.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition duration-200"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition duration-200"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
