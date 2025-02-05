import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Printer, FileText, Truck, CreditCard, Upload } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: <Printer className="w-12 h-12 text-blue-600" />,
      title: "Professional Printing",
      description: "High-quality printing services for all your document needs"
    },
    {
      icon: <FileText className="w-12 h-12 text-blue-600" />,
      title: "Multiple Formats",
      description: "Support for PDF, DOCX, and other common document formats"
    },
    {
      icon: <CreditCard className="w-12 h-12 text-blue-600" />,
      title: "Secure Payments",
      description: "Safe and easy online payments through trusted gateways"
    },
    {
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: "Fast Delivery",
      description: "Quick turnaround times and reliable delivery services"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFile(file);
    // Add logic to calculate page count
  };

  const calculateTotal = () => {
    return pageCount * (printType === 'bw' ? 2 : 8);
  };

  const handleSubmit = () => {
    setLoading(true);
    // Add logic to handle form submission
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to PrintIt!</h1>
          <p className="text-2xl">Your one-stop solution for all printing needs</p>
          </div>
      </div>

      

      {/* Order Section */}
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create New Print Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Document</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload PDF or DOCX file
                      </p>
                    </label>
                  </div>
                </div>

                {/* Page Count Display */}
                {pageCount > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-700">
                      Document Pages: {pageCount}
                    </p>
                  </div>
                )}

                {/* Print Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Print Type</label>
                  <select
                    value={printType}
                    onChange={(e) => setPrintType(e.target.value as 'bw' | 'color')}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="bw">Black & White (₹2/page)</option>
                    <option value="color">Color (₹8/page)</option>
                  </select>
                </div>

                {/* Total Price */}
                {pageCount > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold">
                      Total Price: ₹{calculateTotal()}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!file || loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;