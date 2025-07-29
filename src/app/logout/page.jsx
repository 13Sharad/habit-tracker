'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear the token from localStorage
    localStorage.removeItem('token');

    // Redirect to login page
    router.push('/login');
  }, [router]);

  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold">Logging out...</h2>
    </div>
  );
}