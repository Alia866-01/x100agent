import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: () => void;
}

/**
 * OAuth Callback Handler
 * Processes the OAuth redirect from Neon Auth and completes authentication
 */
const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing OAuth callback');

        // Call authService to handle OAuth callback
        const authResponse = await authService.handleOAuthCallback();

        console.log('[AuthCallback] OAuth callback successful', authResponse);
        setStatus('success');

        // Small delay to show success message
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } catch (error) {
        console.error('[AuthCallback] OAuth callback failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');

        // Redirect to landing after showing error
        setTimeout(() => {
          onError();
        }, 3000);
      }
    };

    handleCallback();
  }, [onSuccess, onError]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>

      <div className="relative z-10 text-center px-6">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-medium text-white mb-2">Completing authentication...</h2>
            <p className="text-gray-400">Please wait while we set up your account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">Authentication successful!</h2>
            <p className="text-gray-400">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">Authentication failed</h2>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
