import React, { useState, useEffect } from 'react';
import './App.css';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  id?: string;
  provider: 'google' | 'facebook';
}

interface User {
  access_token: string;
  id_token?: string;
  profile?: UserProfile;
  [key: string]: any;
}

interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: string;
  reauthorize_required_in: string;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

// Extend window object to include FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fbLoaded, setFbLoaded] = useState(false);

  // Configuration - replace with your actual IDs
  const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id';

  // Function to decode JWT token for Google
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      if (window.FB) {
        setFbLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      document.body.appendChild(script);

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        setFbLoaded(true);
        
        // Check if user is already logged in to Facebook
        window.FB.getLoginStatus((response: FacebookLoginResponse) => {
          if (response.status === 'connected') {
            fetchFacebookUserProfile();
          }
        });
      };
    };

    // Check URL for Google user data after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        setUser(parsedUser);
        
        // Decode the id_token to get Google user profile information
        if (parsedUser.id_token) {
          const profile = decodeJWT(parsedUser.id_token);
          if (profile) {
            setUserProfile({
              name: profile.name,
              email: profile.email,
              picture: profile.picture,
              given_name: profile.given_name,
              family_name: profile.family_name,
              email_verified: profile.email_verified,
              provider: 'google'
            });
          }
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      // Only load Facebook SDK if no Google login detected
      loadFacebookSDK();
    }
  }, []);

  const fetchFacebookUserProfile = () => {
    if (!window.FB) return;

    window.FB.api('/me', { fields: 'name,email,picture' }, (response: any) => {
      if (response && !response.error) {
        const profile: UserProfile = {
          id: response.id,
          name: response.name,
          email: response.email || 'Email not provided',
          picture: response.picture?.data?.url || '',
          provider: 'facebook'
        };
        
        setUserProfile(profile);
        setUser({
          access_token: window.FB.getAuthResponse().accessToken,
          profile: profile
        });
      }
    });
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = `http://localhost:5000/connect/google`;
  };

  const handleFacebookLogin = () => {
    if (!window.FB || !fbLoaded) {
      alert('Facebook SDK not loaded yet. Please try again.');
      return;
    }

    setLoading(true);

    window.FB.login((response: FacebookLoginResponse) => {
      setLoading(false);
      
      if (response.authResponse) {
        console.log('Welcome! Fetching your information...');
        fetchFacebookUserProfile();
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'email' });
  };

  const handleLogout = () => {
    if (userProfile?.provider === 'facebook' && window.FB) {
      window.FB.logout(() => {
        setUser(null);
        setUserProfile(null);
        console.log('User logged out from Facebook.');
      });
    } else {
      // Google logout
      setUser(null);
      setUserProfile(null);
      fetch('http://localhost:5000/logout', { credentials: 'include' });
    }
  };

  const checkFacebookLoginStatus = () => {
    if (!window.FB) return;

    window.FB.getLoginStatus((response: FacebookLoginResponse) => {
      console.log('Facebook login status:', response);
      if (response.status === 'connected') {
        fetchFacebookUserProfile();
      } else {
        if (userProfile?.provider === 'facebook') {
          setUser(null);
          setUserProfile(null);
        }
      }
    });
  };

  if (user && userProfile) {
    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>Welcome!</h1>
            <p className="provider-badge">
              Logged in with {userProfile.provider === 'google' ? 'Google' : 'Facebook'}
            </p>
          </div>
          
          <div className="profile-section">
            <div className="profile-picture">
              <img 
                src={userProfile.picture} 
                alt={`${userProfile.name}'s profile`}
                className="avatar"
              />
            </div>
            
            <div className="profile-info">
              <h2>{userProfile.name}</h2>
              <p className="email">{userProfile.email}</p>
              
              <div className="user-details">
                {userProfile.given_name && (
                  <div className="detail-item">
                    <strong>First Name:</strong> {userProfile.given_name}
                  </div>
                )}
                {userProfile.family_name && (
                  <div className="detail-item">
                    <strong>Last Name:</strong> {userProfile.family_name}
                  </div>
                )}
                {userProfile.id && (
                  <div className="detail-item">
                    <strong>User ID:</strong> {userProfile.id}
                  </div>
                )}
                {userProfile.email_verified !== undefined && (
                  <div className="detail-item">
                    <strong>Email Verified:</strong> 
                    <span className={`verification-badge ${userProfile.email_verified ? 'verified' : 'unverified'}`}>
                      {userProfile.email_verified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="button-group">
            {userProfile.provider === 'facebook' && (
              <button 
                onClick={checkFacebookLoginStatus}
                className="status-btn"
              >
                Check Login Status
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Social Login Demo</h1>
        <p className="subtitle">Connect with your preferred social account</p>
        
        <div className="login-buttons">
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="google-btn"
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connecting...' : 'Login with Google'}
          </button>
          
          <button 
            onClick={handleFacebookLogin} 
            disabled={loading || !fbLoaded}
            className="facebook-btn"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {loading ? 'Connecting...' : !fbLoaded ? 'Loading Facebook...' : 'Login with Facebook'}
          </button>
        </div>
        
        <div className="sdk-status">
          {!fbLoaded && (
            <p className="loading-text">Loading Facebook SDK...</p>
          )}
        </div>
        
        <div className="setup-note">
          <p>
            <strong>Setup Required:</strong> Replace 'your-facebook-app-id' with your actual Facebook App ID and configure your Google OAuth credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;