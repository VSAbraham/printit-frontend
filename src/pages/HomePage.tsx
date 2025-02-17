import React, { useState } from 'react';
import { MapPin, ShoppingCart, Upload, ArrowRight } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center">
    <span className="text-3xl font-bold">
      <span className="text-black">Print</span>
      <span className="text-yellow-400">It</span>
    </span>
  </div>
);

const HomePage = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFile(file);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer">
                <MapPin className="w-5 h-5" />
                <span className="ml-2">Location</span>
              </div>
              <div className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer">
                <ShoppingCart className="w-5 h-5" />
                <span className="ml-2">Cart</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Your <span className="text-red-500">buddy</span> for{" "}
              <span className="text-yellow-400">last-minute</span>{" "}
              <span className="text-green-500">Printouts</span>.
            </h1>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Upload and Get Your Printouts Delivered
                </h2>
                <p className="text-gray-600 mb-6">
                  Quick, reliable printing delivered right to your doorstep
                </p>
                
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drop your file here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports PDF & DOCX
                    </p>
                  </label>
                </div>

                {file && (
                  <button className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center">
                    Proceed to Print
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-lg">Why Choose PrintIt?</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Fast 2-hour delivery</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Budget-friendly rates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>High-quality prints</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-400">2 Hours</div>
              <div className="text-sm text-gray-600">Express Delivery</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-500">₹2</div>
              <div className="text-sm text-gray-600">Per Page</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-500">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;