import React, { useEffect, useRef } from 'react'
import { useAuth0AppContext } from '../context/Auth0AppContext'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Loading = () => {

  const { navigate, fetchUser, user } = useAuth0AppContext()
  let { search } = useLocation()
  const query = new URLSearchParams(search)
  const nextUrl = query.get('next');
  const hasShownMessage = useRef(false); 

  useEffect(()=>{
    const handlePaymentSuccess = async () => {
      // If coming from Stripe payment success and user is authenticated
      if(nextUrl === 'my-orders' && user && !hasShownMessage.current) {
        try {
          // Refresh user data to sync cart (cart should be empty after successful payment)
          await fetchUser();
          toast.success('Payment completed successfully!');
          hasShownMessage.current = true; 
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
      
      if(nextUrl){
        setTimeout(()=>{
          navigate(`/${nextUrl}`)
        },3000) 
      }
    };
    
    handlePaymentSuccess();
  },[nextUrl, user]) 

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary mb-4'>
      </div>
      {nextUrl === 'my-orders' && (
        <p className='text-gray-600 text-center'>Processing your payment...<br/>You will be redirected shortly.</p>
      )}
    </div>
  )
}

export default Loading
