import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const Auth0AppContext = createContext();

export const Auth0AppContextProvider = ({ children }) => {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading, 
    getAccessTokenSilently, 
    logout: auth0Logout 
  } = useAuth0();
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const currency = import.meta.env?.VITE_CURRENCY || '$';

  // Initialize cart - empty for non-authenticated users
  const getInitialCart = () => {
    // Don't load cart from localStorage for non-authenticated users
    return {};
  };
  
  const [cartItems, setCartItems] = useState(getInitialCart());
  const [searchQuery, setSearchQuery] = useState({});

  // Get access token for API calls
  const getAccessToken = async () => {
    try {
      if (isAuthenticated) {
        return await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "openid profile email"
          }
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  // Setup axios interceptor for Auth0 tokens
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (isAuthenticated && !config.url.includes('/seller/') && !config.url.includes('/callback')) {
          const token = await getAccessToken();
          if (token) {
            console.log('Adding Auth0 token to request:', config.url);
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.log('No Auth0 token available for request:', config.url);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated]);

  // Ensure cart is empty for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems({});
      localStorage.removeItem('cartItems');
    }
  }, [isAuthenticated]);

  // Handle Auth0 authentication callback
  useEffect(() => {
    const handleAuth0User = async () => {
      if (isAuthenticated && auth0User && !user) {
        try {
          console.log('Auth0 user object:', auth0User);
          
          // Check if this is a fresh login (URL contains Auth0 callback params or no previous session)
          const isFreashLogin = window.location.search.includes('code=') || 
                               window.location.search.includes('state=') || 
                               !localStorage.getItem('hasActiveSession');
          
          // First, try to fetch existing user data
          try {
            const { data: existingUserData } = await axios.get('/api/auth0-user/is-auth');
            if (existingUserData.success && existingUserData.user) {
              console.log('Existing user data found:', existingUserData.user);
              setUser(existingUserData.user);
              
              // Set cart items from user data (this preserves cart across page refreshes)
              setCartItems(existingUserData.user.cartItems || {});
              
              // Only merge guest cart if there are items in localStorage AND they're different from user's cart
              const guestCart = getInitialCart();
              if (Object.keys(guestCart).length > 0) {
                // Check if guest cart has items not in user's cart
                const userCart = existingUserData.user.cartItems || {};
                let hasNewItems = false;
                
                for (const itemId in guestCart) {
                  if (!userCart[itemId] || userCart[itemId] < guestCart[itemId]) {
                    hasNewItems = true;
                    break;
                  }
                }
                
                if (hasNewItems) {
                  // Merge guest cart with user cart (guest cart takes precedence for quantities)
                  const mergedCart = { ...userCart, ...guestCart };
                  await updateCart(mergedCart);
                  localStorage.removeItem('cartItems'); // Only remove after successful merge
                }
              }
              setShowUserLogin(false);
              
              // Set session flag for future page loads
              localStorage.setItem('hasActiveSession', 'true');
              
              // Check if profile is complete
              if (!existingUserData.user.profileComplete) {
                toast('Please complete your profile', {
                  icon: 'ℹ️',
                  duration: 4000,
                });
                setShowUserLogin(true); // This will show the profile completion form
              } else if (isFreashLogin) {
                // Only show welcome message on fresh login, not on page refresh
                toast.success('Welcome back!');
              }
              return; // Exit early if user already exists
            }
          } catch (existingUserError) {
            console.log('No existing user found, proceeding with callback...');
          }
          
          // If no existing user found, create new user via callback
          const userData = {
            auth0Id: auth0User.sub,
            email: auth0User.email,
            name: auth0User.name || auth0User.given_name || auth0User.nickname || 'User',
            username: auth0User.nickname || auth0User.preferred_username || auth0User.email?.split('@')[0] || 'user',
            contactNumber: auth0User.phone_number || '',
            country: auth0User.country || auth0User.locale || ''
          };

          console.log('Calling Auth0 callback with data:', userData);
          const { data } = await axios.post('/api/auth0-user/callback', userData);
          
          if (data.success) {
            console.log('Auth0 callback successful, user data:', data.user);
            setUser(data.user);
            
            // Set cart items from user data (for new users, this will be empty)
            setCartItems(data.user.cartItems || {});
            
            // Merge cart from localStorage if exists (for guest users who then logged in)
            const guestCart = getInitialCart();
            if (Object.keys(guestCart).length > 0) {
              await updateCart(guestCart);
              localStorage.removeItem('cartItems'); // Only remove after successful merge
            }
            setShowUserLogin(false);
            
            // Set session flag for future page loads
            localStorage.setItem('hasActiveSession', 'true');
            
            // Check if profile is complete
            if (!data.user.profileComplete) {
              toast('Please complete your profile', {
                icon: 'ℹ️',
                duration: 4000,
              });
              setShowUserLogin(true); // This will show the profile completion form
            } else {
              // This is definitely a new login since we created the user
              toast.success('Welcome to our store!');
            }
          } else {
            console.error('Auth0 callback failed:', data.message);
            toast.error(data.message);
          }
        } catch (error) {
          console.error('Auth0 callback error:', error);
          toast.error('Authentication failed');
        }
      }
    };

    if (!isLoading) {
      handleAuth0User();
    }
  }, [isAuthenticated, auth0User, isLoading, user]);

  // Fetch seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // Fetch user data (only used for refreshing user data)
  const fetchUser = async () => {
    try {
      if (isAuthenticated && user) {
        console.log('Fetching updated user data...');
        const { data } = await axios.get('/api/auth0-user/is-auth');
        if (data.success) {
          console.log('Updated user data received:', data.user);
          setUser(data.user);
          setCartItems(data.user.cartItems || {});
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Don't show error toast here as it might be expected during initial login
    }
  };

  // Update cart
  const updateCart = async (newCartItems) => {
    try {
      if (isAuthenticated && user) {
        const { data } = await axios.post('/api/cart/update', { cartItems: newCartItems });
        if (data.success) {
          setCartItems(data.cartItems);
        }
      } else {
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
        setCartItems(newCartItems);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  // Add to cart
  const addToCart = (productId, size) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    const currentCart = { ...cartItems };
    const itemKey = size ? `${productId}_${size}` : productId;
    
    if (currentCart[itemKey]) {
      currentCart[itemKey] += 1;
    } else {
      currentCart[itemKey] = 1;
    }
    
    updateCart(currentCart);
    toast.success('Item added to cart');
  };

  // Remove from cart
  const removeFromCart = (productId, size) => {
    const currentCart = { ...cartItems };
    const itemKey = size ? `${productId}_${size}` : productId;
    
    if (currentCart[itemKey] > 1) {
      currentCart[itemKey] -= 1;
    } else {
      delete currentCart[itemKey];
    }
    
    updateCart(currentCart);
  };

  // Get cart total
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemKey in cartItems) {
      const quantity = cartItems[itemKey];
      const productId = itemKey.includes('_') ? itemKey.split('_')[0] : itemKey;
      const product = products.find(p => p._id === productId);
      if (product) {
        totalAmount += (product.offerPrice || product.price) * quantity;
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Get cart count
  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  // Update cart item quantity
  const updateCartItem = (productId, quantity) => {
    const currentCart = { ...cartItems };
    if (quantity > 0) {
      currentCart[productId] = quantity;
    } else {
      delete currentCart[productId];
    }
    updateCart(currentCart);
    toast.success('Cart updated');
  };

  // Clear cart
  const clearCart = async () => {
    const emptyCart = {};
    setCartItems(emptyCart);
    localStorage.removeItem('cartItems');
    
    if (isAuthenticated && user) {
      try {
        await axios.post('/api/cart/update', { cartItems: emptyCart });
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      }
    }
    // No success message - cart clears silently
  };

  // Logout user
  const logoutUser = async () => {
    try {
      setUser(null);
      setCartItems({});
      localStorage.removeItem('cartItems');
      localStorage.removeItem('hasActiveSession'); // Clear session flag
      
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    if (!isLoading) {
      fetchProducts();
      fetchSeller();
      // Don't automatically fetch user - let the Auth0 callback handle user creation first
    }
  }, [isLoading]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateCart,
    updateCartItem,
    clearCart,
    getCartAmount,
    getCartCount,
    logoutUser,
    fetchProducts,
    fetchUser,
    fetchSeller,
    currency,
    searchQuery,
    setSearchQuery,
    isAuthenticated,
    isLoading,
    auth0User
  };

  return (
    <Auth0AppContext.Provider value={value}>
      {children}
    </Auth0AppContext.Provider>
  );
};

export const useAuth0AppContext = () => {
  const context = useContext(Auth0AppContext);
  if (!context) {
    throw new Error('useAuth0AppContext must be used within an Auth0AppContextProvider');
  }
  return context;
};
