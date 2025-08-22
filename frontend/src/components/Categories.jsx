import React from 'react';
import { assets, categories} from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Categories</p>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
      xl:grid-cols-5 mt-6 gap-4 justify-items-center'>

      {categories.map((category, index) => (
        <div key={index} className='group cursor-pointer border border-gray-500/20 rounded-md p-3 flex flex-col
        justify-center items-center w-full max-w-48 bg-white shadow-sm hover:shadow-md transition-all'
        onClick={()=>{
          navigate(`/products/${category.path.toLowerCase()}`);
          scrollTo(0,0)
        }}
        >
          <div className='w-full h-40 flex items-center justify-center overflow-hidden rounded-md mb-3'
          style={{backgroundColor: category.bgColor}}>
            <img src={category.image} alt={category.name}
            className='group-hover:scale-105 transition w-full h-full object-contain'/>
          </div>
          <p className='text-sm font-medium text-center text-gray-700'>{category.name}</p>
        </div>
      ))}
      </div>
    </div>

  )
}

export default Categories
