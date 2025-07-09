import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;