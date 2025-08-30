import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth0AppContext } from '../context/Auth0AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Auth0Login = () => {
  const { loginWithRedirect, isAuthenticated, user, isLoading } = useAuth0();
  const { setShowUserLogin, user: appUser, setUser } = useAuth0AppContext();
  const [additionalInfo, setAdditionalInfo] = useState({
    name: '',
    username: '',
    contactNumber: '',
    country: ''
  });
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user needs to complete profile
  useEffect(() => {
    if (isAuthenticated && appUser && !appUser.profileComplete) {
      setShowAdditionalForm(true);
      setAdditionalInfo({
        name: appUser.name || '',
        username: appUser.username || '',
        contactNumber: appUser.contactNumber || '',
        country: appUser.country || ''
      });
    }
  }, [isAuthenticated, appUser]);

  const handleAuth0Login = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: window.location.pathname
        }
      });
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Auth0 login error:', error);
    }
  };

  const handleAdditionalInfoSubmit = async (e) => {
    e.preventDefault();
    
    if (!additionalInfo.name || !additionalInfo.username || !additionalInfo.contactNumber || !additionalInfo.country) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending profile update with data:', additionalInfo);
      const { data } = await axios.post('/api/auth0-user/update-profile', additionalInfo);
      
      console.log('Profile update response:', data);
      if (data.success) {
        console.log('Profile updated successfully. New user data:', data.user);
        toast.success('Profile completed successfully!');
        
        // Update user data in context instead of reloading
        setUser(data.user);
        console.log('User state updated in context');
        
        setShowAdditionalForm(false);
        setShowUserLogin(false);
      } else {
        console.error('Profile update failed:', data.message);
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center bg-black/50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && showAdditionalForm) {
    return (
      <div onClick={() => setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>
        <form onSubmit={handleAdditionalInfoSubmit} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
          <p className="text-2xl font-medium m-auto">
            <span className="text-primary">Complete</span> Your Profile
          </p>
          <p className="text-center text-gray-500 text-sm">
            Welcome {user?.name}! Please provide additional information to complete your profile.
          </p>
          
          <div className="w-full">
            <p>Username</p>
            <input 
              onChange={(e) => setAdditionalInfo({...additionalInfo, username: e.target.value})} 
              value={additionalInfo.username} 
              placeholder="Enter username" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
              type="text" 
              required 
            />
          </div>
          
          <div className="w-full">
            <p>Full Name</p>
            <input 
              onChange={(e) => setAdditionalInfo({...additionalInfo, name: e.target.value})} 
              value={additionalInfo.name} 
              placeholder="Enter your full name" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
              type="text" 
              required 
            />
          </div>
          
          <div className="w-full">
            <p>Contact Number</p>
            <input 
              onChange={(e) => setAdditionalInfo({...additionalInfo, contactNumber: e.target.value})} 
              value={additionalInfo.contactNumber} 
              placeholder="Enter phone number" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
              type="tel" 
              required 
            />
          </div>
          
          <div className="w-full">
            <p>Country</p>
            <input 
              onChange={(e) => setAdditionalInfo({...additionalInfo, country: e.target.value})} 
              value={additionalInfo.country} 
              placeholder="Enter country" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
              type="text" 
              required 
            />
          </div>
          
          <button 
            disabled={isSubmitting}
            className="bg-primary hover:bg-accent transition-all text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div onClick={() => setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span> Login
        </p>
        
        <div className="w-full space-y-4">
          <button 
            onClick={handleAuth0Login}
            className="bg-primary hover:bg-accent transition-all text-white w-full py-2 rounded-md cursor-pointer"
          >
            Login with Auth0
          </button>
          
          <div className="text-center text-gray-500 text-xs">
            Secure authentication powered by Auth0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth0Login;
