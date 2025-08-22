import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

 const Cart = () => {
    const {products, currency, cartItems, removeFromCart, updateCartItem, getCartCount, navigate, getCartAmount, axios, user, clearCart} = useAppContext();
    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
        const [PaymentOption, setPaymentOption] = useState("COD");
        const [purchaseDate, setPurchaseDate] = useState(() => {
            const today = new Date();
            return today.toISOString().split('T')[0];
        });
        const [preferredHour, setPreferredHour] = useState('1');
        const [preferredPeriod, setPreferredPeriod] = useState('AM');

    const getCart = ()=>{
            let tempArray = [];
            for(const key in cartItems) {
                const product = products.find((item) => item._id === key);
                if (product) {
                    const prodCopy = { ...product, quantity: cartItems[key] };
                    tempArray.push(prodCopy);
                }
            }
            setCartArray(tempArray);
    }

    const getUserAddress = async () =>{
        try {
            const { data } = await axios.get('/api/address/get');
            if(data.success){
                setAddresses(data.addresses)
                if(data.addresses.length > 0){
                    setSelectedAddress(data.addresses[0]);
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

        // Helper to check if selected date is Sunday
        const isSunday = (dateStr) => {
            const date = new Date(dateStr);
            return date.getDay() === 0;
        };

        const placeOrder = async () => {
       try {

           if(!selectedAddress){
            return toast.error("Please select an address");
           }
           if(!purchaseDate){
            return toast.error("Please select a purchase date");
           }
           if(isSunday(purchaseDate)){
            return toast.error("Purchase date cannot be a Sunday");
           }
           const preferredDeliveryTime = `${preferredHour} ${preferredPeriod}`;

           //Place Order with COD 
           if(PaymentOption === "COD"){
            const { data } = await axios.post('/api/order/cod', {
                userId: user._id,
                items:cartArray.map(item=>({product: item._id, quantity: item.quantity})),
                address: selectedAddress._id,
                purchaseDate,
                preferredDeliveryTime
            })

            if(data.success){
                toast.success(data.message)
                // Clear cart both locally and in backend
                await clearCart()
                navigate('/my-orders')
            }else{
                toast.error(data.message)
            }
           }else{
            //Place Order with Stripe
             const { data } = await axios.post('/api/order/stripe', {
                userId: user._id,
                items:cartArray.map(item=>({product: item._id, quantity: item.quantity})),
                address: selectedAddress._id,
                purchaseDate,
                preferredDeliveryTime
            })

            if(data.success){
              window.location.replace(data.url)
            }else{
                toast.error(data.message)
            }
           }
       } catch (error) {
            toast.error(error.message)
       }
    }

    useEffect(() =>{
      if(products.length >0 && cartItems){
        getCart();
      }
    },[products, cartItems])

    useEffect(() => {
        if(user){
            getUserAddress()
        }
    },[user])
    
    return products.length >0 && cartItems ?(
        <div className="flex flex-col md:flex-row mt-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={()=>{
                              navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                        value={cartItems[product._id]}
                                        className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ?
                                              cartItems[product._id] : 9
                                            ).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={()=> removeFromCart(product._id)}
                        className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>)
                )}

                <button onClick={()=>{
                  navigate("/products"); scrollTo(0,0)
                }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                   <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ?
                        `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` :
                        "No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                               {addresses.map((address, index)=>(
                               <p key={index} onClick={() => {setSelectedAddress(address);
                                setShowAddress(false)}}
                               className="text-gray-500 p-2 hover:bg-gray-100">
                                    {address.street}, {address.city}, {address.state}, {address.country}
                                </p>))}
                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>


                                {/* Purchase Date Picker */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-1">Date of Purchase</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 bg-white px-3 py-2 outline-none"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={purchaseDate}
                                        onChange={e => setPurchaseDate(e.target.value)}
                                    />
                                    {isSunday(purchaseDate) && (
                                        <span className="text-red-500 text-xs">Sundays are not allowed.</span>
                                    )}
                                </div>

                                {/* Preferred Delivery Time */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-1">Preferred Delivery Time</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="border border-gray-300 bg-white px-2 py-2 outline-none"
                                            value={preferredHour}
                                            onChange={e => setPreferredHour(e.target.value)}
                                        >
                                            {Array.from({length: 12}, (_, i) => (
                                                <option key={i+1} value={i+1}>{i+1}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="border border-gray-300 bg-white px-2 py-2 outline-none"
                                            value={preferredPeriod}
                                            onChange={e => setPreferredPeriod(e.target.value)}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                                <hr className="border-gray-300 mt-4" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{getCartAmount() * 2 / 100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>
                          {currency}{getCartAmount() + getCartAmount() * 2 / 100}
                        </span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-accent transition">
                    {PaymentOption === "COD" ? "Place Order" : "proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : null;
}

export default Cart;