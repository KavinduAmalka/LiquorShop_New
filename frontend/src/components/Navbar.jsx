import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets.js' // Adjust the path as necessary
import { useAppContext } from '../context/AppContext.jsx'

const Navbar = () => {
  const [open, setOpen] = React.useState(false)
  const {user, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, logoutUser} = useAppContext();

  useEffect(()=>{
    if(searchQuery.length >0){
      navigate("/products")
    }
  },[searchQuery])

  return (
     <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">

            <NavLink to='/'onClick={()=> setOpen(false)} className="flex items-center gap-2">
                <img className="h-20 w-20" src={assets.logo} alt="Logo" />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/products'>All Product</NavLink>
                <NavLink to='/'>Contact</NavLink>

                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
                    <img className="w-4 h-4" src={assets.search_icon} alt="Search Icon" />
                </div>   

                <div onClick={()=>navigate("/cart")}className="relative cursor-pointer">
                    <img className="w-6 opacity-80" src={assets.nav_cart_icon} alt='Cart'/>
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>

                {!user ? ( 
                  <button onClick={()=> setShowUserLogin(true)} 
                    className="cursor-pointer px-8 py-2 bg-primary hover:bg-accent transition text-white rounded-full">
                      Login
                  </button>
                ) : (
                  <div className='relative group flex flex-col items-center'>
                    <img src={assets.profile_icon} alt="Profile" className="w-10"/>
                    {user?.name && (
                      <span className="text-xs mt-1 font-medium text-gray-700 whitespace-nowrap">{user.name}</span>
                    )}
                    <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40'>
                      <li onClick={()=>navigate("my-orders")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>My Orders</li>
                      <li onClick={logoutUser} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>Logout</li>
                    </ul>
                  </div>
                )}
            </div>

            <div className='flex items-center gap-6 sm:hidden'>
              <div onClick={()=>navigate("/cart")}className="relative cursor-pointer">
                    <img className="w-6 opacity-80" src={assets.nav_cart_icon} alt='Cart'/>
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>
              <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" >
                {/* Menu Icon SVG */}
                <img src={assets.menu_icon} alt="Menu" />
            </button>
            </div>
            

            {/* Mobile Menu */}
            { open && (
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[100px] right-0 w-14/16 h-screen bg-white shadow-md py-4 flex-col items-end gap-5 px-10 text-sm md:hidden z-100`}>
                <NavLink onClick={()=> setOpen(false)} to='/' className="text-right">Home</NavLink>
                <NavLink onClick={()=> setOpen(false)} to='/products' className="text-right">All Product</NavLink>
                {user && 
                  <NavLink onClick={()=> setOpen(false)} to='/my-orders' className="text-right">My Orders</NavLink>
                }
                <NavLink onClick={()=> setOpen(false)} to='/' className="text-right">Contact</NavLink>
                {user && user.name && (
                  <div className="flex flex-col items-end w-full mt-2">
                    <img src={assets.profile_icon} alt="Profile" className="w-10"/>
                    <span className="text-xs mt-1 font-medium text-gray-700 whitespace-nowrap">{user.name}</span>
                  </div>
                )}

                {!user ?(
                  <button onClick={()=>{
                    setOpen(false);
                    setShowUserLogin(true);
                  }}
                  className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-accent transition text-white rounded-full text-sm">
                    Login
                </button>
                ):(
                  <button onClick={logoutUser}
                  className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-accent transition text-white rounded-full text-sm">
                    Logout
                </button>
                )}
            </div>
            ) }

        </nav>
              
  )
}

export default Navbar
