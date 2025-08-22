import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
  const {products} = useAppContext();
  
  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Best Seller</p>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6 justify-items-center'>
        {products && products.length > 0 ? (
          products.slice(0, 5).map((product, index) => (
            <ProductCard key={product._id || index} product={product} />
          ))
        ) : (
          <p className='text-gray-500 col-span-full text-center'>Loading products...</p>
        )}
      </div>      
    </div>
  )
}

export default BestSeller
