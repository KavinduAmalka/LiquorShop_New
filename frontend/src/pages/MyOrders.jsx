import React, { useEffect, useState } from 'react'
import { useAuth0AppContext } from '../context/Auth0AppContext'
import { dummyOrders } from '../assets/assets'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const MyOrders = () => {

  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const {currency, user} = useAuth0AppContext()
  const location = useLocation()

  const fetchMyOrders = async () => {
     try {
         setLoading(true)
         const { data } = await axios.get('/api/order/user')
         if(data.success){
            setMyOrders(data.orders)
         }
     } catch (error) {
         console.log(error);
     } finally {
         setLoading(false)
     }
  }

  // Fetch orders when user changes, location changes, or component mounts
  useEffect(()=>{
    if(user){
          fetchMyOrders()
    }
  },[user, location.search]) // This will trigger when user changes or URL params change

  return (
    <div className='mt-16 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
       <p className='text-2xl font-medium uppercase'>My orders</p>
       <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>
      
      {loading && (
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary'></div>
          <span className='ml-2 text-gray-600'>Loading orders...</span>
        </div>
      )}
      
      {!loading && myOrders.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-600 text-lg'>No orders found</p>
          <p className='text-gray-400 text-sm mt-2'>Your orders will appear here after you make a purchase</p>
        </div>
      )}
      
      {!loading && myOrders.map((order, index) => (
        <div key={index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-5xl'>
          <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col'>
            <span>OrderId : {order._id}</span>
            <span>Payment : {order.paymentType}</span>
            <span>Total Amount : {currency}{order.amount}</span>
          </p>
          {order.items.map((item, index)=>(
            <div key={index}
            className={`relative bg-white text-gray-500/70 ${
              order.items.length !== index + 1 && "border-b"
            } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-18 w-full max-w-4xl`}>
             <div className='flex items-center mb-4 md:mb-0'>
              <div className='bg-primary/10 p-4 rounded-lg w-24 h-24 flex items-center justify-center'>
               <img src={item.product.image[0]} alt="" className='h-18  '/>
              </div>
              <div className='ml-4'>
                <h2 className='text-xl font-medium text-gray-800'>
                  {item.product.name}
                </h2>
                <p>Category: {item.product.category}</p>
              </div>
             </div>
            
             <div className='flex flex-col md:flex-row md:items-center gap-0 md:gap-16'>
             <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
               <p>Quantity: {item.quantity || "1"}</p>
               <p>Status: {order.status}</p>
               <p>Date: {order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString() : '-'}</p>
               <p className='w-max'>Preferred Delivery Time: {order.preferredDeliveryTime || '-'}</p>
               <p>State: {order.address && order.address.state ? order.address.state : '-'}</p>
             </div>
             <p className='text-primary text-lg font-medium w-max'>
              Amount: {currency}{item.product.offerPrice * item.quantity}
             </p>
             </div>

            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default MyOrders
