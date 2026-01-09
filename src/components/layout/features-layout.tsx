import React from 'react'

// Local Imports
import Footer from '../dom/footer'

const FeaturesLayout = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    return (
        <div className={`${className}`}>

            <div className='sm:px-20 2xl:px-0'>
                {children}
            </div>

            <Footer />
        </div>
    )
}

export default FeaturesLayout
