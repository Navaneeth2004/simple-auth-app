import React, { useState, useEffect } from 'react';
import './App.css';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
}

interface User {
  access_token: string;
  id_token: string;
  profile?: UserProfile;
  [key: string]: any;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to decode JWT token
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
    // Check URL for user data after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        setUser(parsedUser);
        
        // Decode the id_token to get user profile information
        if (parsedUser.id_token) {
          const profile = decodeJWT(parsedUser.id_token);
          if (profile) {
            setUserProfile({
              name: profile.name,
              email: profile.email,
              picture: profile.picture,
              given_name: profile.given_name,
              family_name: profile.family_name,
              email_verified: profile.email_verified
            });
          }
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogin = (provider: 'google' | 'facebook') => {
    setLoading(true);
    window.location.href = `http://localhost:5000/connect/${provider}`;
  };

  const handleLogout = () => {
    setUser(null);
    setUserProfile(null);
    fetch('http://localhost:5000/logout', { credentials: 'include' });
  };

  if (user && userProfile) {
    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>Welcome!</h1>
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
                <div className="detail-item">
                  <strong>First Name:</strong> {userProfile.given_name}
                </div>
                <div className="detail-item">
                  <strong>Last Name:</strong> {userProfile.family_name}
                </div>
                <div className="detail-item">
                  <strong>Email Verified:</strong> 
                  <span className={`verification-badge ${userProfile.email_verified ? 'verified' : 'unverified'}`}>
                    {userProfile.email_verified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Social Login Demo</h1>
        
        <div className="login-buttons">
          <button 
            onClick={() => handleLogin('google')} 
            disabled={loading}
            className="google-btn"
          >
            {loading ? 'Connecting...' : 'Login with Google'}
          </button>
          <button 
            onClick={() => handleLogin('facebook')} 
            disabled={loading}
            className="facebook-btn"
          >
            {loading ? 'Connecting...' : 'Login with Facebook'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;