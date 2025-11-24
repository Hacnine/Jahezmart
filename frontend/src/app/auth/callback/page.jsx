"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../store/slices/authSlice';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Decode JWT to get user info (simple base64 decode of payload)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.email,
          role: payload.role || 'user',
        };

        // Store credentials in Redux and localStorage
        dispatch(setCredentials({ token, user }));

        // Redirect to account page
        router.replace('/account');
      } catch (error) {
        console.error('Failed to process OAuth callback:', error);
        router.replace('/signin?error=oauth_failed');
      }
    } else {
      router.replace('/signin?error=no_token');
    }
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orangeRed mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
