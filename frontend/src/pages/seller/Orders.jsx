import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const Orders = () => {

    const {currency, axios, isSeller} = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isSeller) {
            fetchOrders();
        }
    }, [isSeller])

    // Sort orders by purchaseDate or createdAt descending (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = a.purchaseDate ? new Date(a.purchaseDate) : new Date(a.createdAt);
        const dateB = b.purchaseDate ? new Date(b.purchaseDate) : new Date(b.createdAt);
        return dateB - dateA;
    });

    // Divide orders by payment method
    const codOrders = sortedOrders.filter(order => order.paymentType === 'COD');
    const onlineOrders = sortedOrders.filter(order => order.paymentType !== 'COD');

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState('COD');

    const renderOrder = (order, index) => (
        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-5xl rounded-md border border-gray-300">
            <div className="flex gap-5 max-w-80">
                <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                <div>
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                            <p className="font-medium">
                                {item.product.name}{" "}
                                <span className="text-primary">x {item.quantity}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-sm md:text-base text-black/60">
                <p className='text-black/80'>{order.address.firstName} {order.address.lastName}</p>
                <p>{order.address.street}, {order.address.city}</p>
                <p>{order.address.state}, {order.address.zipCode}, {order.address.country}</p>
                <p></p>
                <p>{order.address.phone}</p>
            </div>

            <p className="font-medium text-lg my-auto">{currency}{order.amount}</p>

            <div className="flex flex-col text-sm md:text-base text-black/60">
                <p>Method: {order.paymentType}</p>
                <p>
                    Date: {order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}<br/>
                    Preferred Delivery Time: {order.preferredDeliveryTime}
                </p>
                <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
            </div>
        </div>
    );

        return (
                <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
                        <div className="md:p-10 p-4 space-y-4">
                                <h2 className="text-lg font-medium mb-4 md:text-2xl">Orders List</h2>
                                <div className="flex gap-4 mb-6">
                                    <button
                                        className={`px-4 py-2 rounded ${selectedTab === 'COD' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}
                                        onClick={() => setSelectedTab('COD')}
                                    >
                                        Cash On Delivery (COD)
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded ${selectedTab === 'ONLINE' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}
                                        onClick={() => setSelectedTab('ONLINE')}
                                    >
                                        Online Payment
                                    </button>
                                </div>
                                {selectedTab === 'COD' ? (
                                    codOrders.length === 0 ? <p className="text-gray-400">No COD orders found.</p> : codOrders.map(renderOrder)
                                ) : (
                                    onlineOrders.length === 0 ? <p className="text-gray-400">No online payment orders found.</p> : onlineOrders.map(renderOrder)
                                )}
                        </div>
                </div>
        )
}

export default Orders
