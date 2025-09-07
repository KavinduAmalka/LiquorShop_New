import React, { useEffect, useRef, useState } from 'react'
import { useAuth0AppContext } from '../context/Auth0AppContext'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Loading = () => {

  const { navigate, fetchUser, user, clearCart } = useAuth0AppContext()
  let { search } = useLocation()
  const query = new URLSearchParams(search)
  const nextUrl = query.get('next');
  const hasProcessedPayment = useRef(false); 
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(()=>{
    const handlePaymentSuccess = async () => {
      // Prevent multiple executions
      if (isProcessing || hasProcessedPayment.current) return;
      
      // If coming from Stripe payment success and user is authenticated
      if(nextUrl === 'my-orders' && user) {
        setIsProcessing(true);
        hasProcessedPayment.current = true;
        
        try {
          // Clear cart immediately after successful payment (like COD does)
          await clearCart();
          toast.success('Payment completed successfully!');
          
          // Refresh user data to ensure we have the latest information
          await fetchUser();
          
        } catch (error) {
          console.error('Error processing payment completion:', error);
          toast.error('Error processing payment completion');
        } finally {
          setIsProcessing(false);
        }
      }
      
      if(nextUrl && !isProcessing){
        setTimeout(()=>{
          // Add timestamp parameter to force refresh when navigating to orders
          if(nextUrl === 'my-orders') {
            navigate(`/${nextUrl}?refresh=${Date.now()}`);
          } else {
            navigate(`/${nextUrl}`)
          }
        }, 2000) // Redirect after 2 seconds
      }
    };
    
    // Only run if we haven't processed the payment yet
    if (!hasProcessedPayment.current) {
      handlePaymentSuccess();
    }
  },[nextUrl, user]) // Removed clearCart from dependencies 

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
