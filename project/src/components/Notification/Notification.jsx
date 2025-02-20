import React from 'react'
import Header from '../Header/Header'   
import Footer from '../Footer/Footer'
function Notification() {
  return (
    <div className="notification-container">
      <Header />
      <main className="h-80 notification-content">
        {/* Add your notification content here */}
        <h1 className='mt-20 h-20 text-2xl font-bold text-center text-black'>No Notifications</h1>
      </main>
      <Footer />
    </div>
  )
}

export default Notification