import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center bg-slate-50'>
      <img
      src="/404_NotFound.png"
      alt="Page Not Found"
      className='max-w-full mb-6 w-96'
      />

      <p className='text-xl font-semibold'>
        Sorry, the page you are looking for does not exist.
      </p>
      <a href="/" className="inline-block mt-6 px-6 py-3 font-medium text-white transition shadow-md bg-primary rounded-2xl hover:bg-primary-dark">
        Go back home
      </a>

    </div>
  )
}

export default NotFound
