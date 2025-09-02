import e from "express";
import Product from "../models/Product.js";
import cloudinary from "../confligs/cloudinary.js";



// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    // Validate that productData exists and is valid JSON
    if (!req.body.productData) {
      return res.status(400).json({ success: false, message: "Product data is required" });
    }

    let productData;
    try {
      productData = JSON.parse(req.body.productData);
    } catch (parseError) {
      return res.status(400).json({ success: false, message: "Invalid product data format" });
    }

    // Validate required fields
    const { name, description, category, price, offerPrice } = productData;
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category, and price are required" });
    }

    // Validate data types and ranges
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, message: "Price must be a positive number" });
    }

    if (offerPrice && (typeof offerPrice !== 'number' || offerPrice <= 0)) {
      return res.status(400).json({ success: false, message: "Offer price must be a positive number" });
    }

    const images = req.files;
    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { 
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          max_file_size: 5000000 // 5MB limit
        });
        return result.secure_url;
      })
    );

    // Create product with validated data
    const newProduct = await Product.create({ 
      name: name.trim(),
      description: Array.isArray(description) ? description : [description],
      category: category.trim(),
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      image: imageUrl 
    });

    res.json({ success: true, message: "Product added successfully", product: newProduct });

  } catch (error) {
    console.error('Product creation error:', error.message);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
}

// Get Product List : /api/product/list
export const productList = async (req, res) => {
  try{
    const products = await Product.find({})
    res.json({success: true, products});
  }catch(error){
    console.log(error.message);
    res.status(500).json({success: false, message: error.message});
  }
}

//Get single product : /api/product/ id
export const productByID = async (req, res) => {
  try{
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({success: true, product});
  }catch(error){
    console.log(error.message);
    res.status(500).json({success: false, message: error.message});
  }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const {id, inStock} = req.body
    await Product.findByIdAndUpdate(id, {inStock})
    res.json({success: true, message: "Product stock updated successfully"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({success: false, message: error.message});
  }
}