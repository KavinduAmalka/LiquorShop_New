import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
      const { userId, items, address, purchaseDate, preferredDeliveryTime } = req.body;
      console.log('COD Order Request:', { userId, items, address, purchaseDate, preferredDeliveryTime });
      if(!address || !items || items.length === 0 || !purchaseDate || !preferredDeliveryTime){
        return res.json({success: false, message: "Invalid order details"});
      }
      // Calculate Amount Using Items
      let amount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error('Product not found:', item.product);
          return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
        }
        amount += product.offerPrice * item.quantity;
      }
      // Add Tax Charge (2%)
      amount += Math.floor(amount * 0.02); 
      await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType: 'COD',
        purchaseDate,
        preferredDeliveryTime
      });
      return res.json({success: true, message: "Order placed successfully"});
  } catch (error) {
    console.error('Error in placeOrderCOD:', error);
    return res.status(500).json({success: false, message: error.message});
  }
}

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
      const { userId, items, address, purchaseDate, preferredDeliveryTime } = req.body;
      const {origin} = req.headers;
      console.log('Stripe Order Request:', { userId, items, address, purchaseDate, preferredDeliveryTime });
      if(!address || !items || items.length === 0 || !purchaseDate || !preferredDeliveryTime){
        return res.json({success: false, message: "Invalid order details"});
      }
      let productData = [];
      let amount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error('Product not found:', item.product);
          return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
        }
        productData.push({
          name: product.name,
          price: product.offerPrice,
          quantity: item.quantity,
        });
        amount += product.offerPrice * item.quantity;
      }
      // Add Tax Charge (2%)
      amount += Math.floor(amount * 0.02); 
      const order = await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType: 'Online',
        purchaseDate,
        preferredDeliveryTime
      });
      //Stripe Gateway Inialize
      const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
      // Create line items for Stripe
      const line_items = productData.map((item)=>{
        return {
          price_data: {
            currency: 'LKR',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.floor(item.price + item.price * 0.02)  * 100 
          },
          quantity: item.quantity,
        }
      })
      //Create session
      const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: `${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata:{
          orderId: order._id.toString(),
          userId,
        }
      })
      return res.json({success: true, url: session.url});
  } catch (error) {
    console.error('Error in placeOrderStripe:', error);
    return res.status(500).json({success: false, message: error.message});
  }
}

// Stripe Webhook to Verify Payment Action : /stripe
export const stripeWebhooks = async (request, response) => {
  // Stripe Gateway Inialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;

  try {
      event = stripeInstance.webhooks.constructEvent(
          request.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
      );
  } catch (error) {
      response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type){
    case "payment_intent.succeeded":{
       const paymentIntent = event.data.object;
       const paymentIntentId = paymentIntent.id;

       //Getting Session Metadata
       const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
       });

       const { orderId, userId} =session.data[0].metadata;
       //Mark Payment as Paid
       await Order.findByIdAndUpdate(orderId, {isPaid: true})
       //Clear user cart
       await User.findByIdAndUpdate(userId, {cartItems: {}});
       break;
    }
  case "payment_intent.payment_failed":{
     const paymentIntent = event.data.object;
       const paymentIntentId = paymentIntent.id;

       //Getting Session Metadata
       const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
       });

       const { orderId} =session.data[0].metadata;
       await Order.findByIdAndDelete(orderId);
        break;
  }
    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({received: true});
}

// Get Orders by User Id : /api/order/user
export const getUserOrders = async (req, res) =>{
   try {
      const userId = req.user.id; // Get userId from authenticated user
      const orders = await Order.find({
        userId,
        $or: [{paymentType: 'COD'}, {isPaid: true}]
      }).populate("items.product address").sort({createdAt: -1});
      res.json({success: true, orders});
   } catch (error) {
      res.status(500).json({success: false, message: error.message});
   }
}

// Get All Orders (for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) =>{
   try {
      const orders = await Order.find({
        $or: [{paymentType: 'COD'}, {isPaid: true}]
      }).populate("items.product address").sort({createdAt: -1});
      res.json({success: true, orders});
   } catch (error) {
      res.status(500).json({success: false, message: error.message});
   }
}