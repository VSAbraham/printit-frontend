import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Processing your files...</h2>
        <p className="text-gray-600 mt-2">Please wait while we prepare your order</p>
      </div>
    </div>
  );
};

export default LoadingScreen;