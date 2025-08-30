import React, { use, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAuth0AppContext } from '../context/Auth0AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

// Input Field Component
const InputField = ({type, placeholder, name, handleChange, address})=>(
   <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none
   text-gray-500 focus:border-primary transition'
   type={type}
   placeholder={placeholder}
   name={name}
   onChange={handleChange}
   value={address[name]}
   required
   />
)
const AddAddress = () => {

  const {user, navigate} = useAuth0AppContext()

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street:"",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value} = e.target;

    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value
    }))
  }


  const onSubmitHandler = async (e)=> {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to add address");
      navigate('/');
      return;
    }
    
    try {
  const { data } = await axios.post('/api/address/add', {address, userId: user.email});

        if(data.success){
          toast.success(data.message);
          navigate('/cart')
        }else{
          toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(!user){
      navigate('/cart')
    }
  },[])

  return (
    <div className='mt-16 pb-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping<span
      className='font-semibold text-primary'> Address</span></p>
      <div className='flex flex-col md:flex-row justify-between mt-10 items-center'>
        <div className='flex-1 max-w-md w-full'> 
          <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='firstName' type='text' placeholder='First Name'/>
              <InputField handleChange={handleChange} address={address} name='lastName' type='text' placeholder='Last Name'/>
            </div>
            <InputField handleChange={handleChange} address={address} name='email' type='email' placeholder='Email Address'/>
            <InputField handleChange={handleChange} address={address} name='street' type='text' placeholder='Street'/>
            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='city' type='text' placeholder='City'/>
              <InputField handleChange={handleChange} address={address} name='state' type='text' placeholder='State'/>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='zipCode' type='number' placeholder='Zip code'/>
              <InputField handleChange={handleChange} address={address} name='country' type='text' placeholder='Country'/>
            </div>
            <InputField handleChange={handleChange} address={address} name='phone' type='text' placeholder='Phone'/>
            <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-accent transition cursor-pointer uppercase'>
              Save Address
            </button>
          </form>
        </div>
        <img 
          className='w-70 h-70 md:w-100 md:h-100 object-contain md:mr-16 mb-8 md:mb-0 md:mt-0 transition-all duration-300' 
          src={assets.add_address_image}  
          alt='Add Address'
        />
      </div>
    </div>
  )
}

export default AddAddress
