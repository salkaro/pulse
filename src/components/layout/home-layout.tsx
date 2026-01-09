import React from 'react'

// Local Imports
import Navbar from '../dom/navbar'
import Footer from '../dom/footer'

const HomeLayout = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    return (
        <div className={`${className}`}>
            <Navbar />

            <div className='sm:px-20 2xl:px-0'>
                {children}
            </div>

            <Footer />
        </div>
    )
}

export default HomeLayout
