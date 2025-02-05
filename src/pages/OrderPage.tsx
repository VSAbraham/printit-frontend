import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Upload, Settings } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const OrderPage = () => {
  const location = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [loading, setLoading] = useState(false);
  const [copies, setCopies] = useState(1);
  const [doubleSided, setDoubleSided] = useState(false);
  const [error, setError] = useState<string>('');

  const prices = {
    bw: 2,   // Price per page for black & white
    color: 8 // Price per page for color
  };

  useEffect(() => {
    const uploadedFiles = location.state?.uploadedFiles;
    if (uploadedFiles && uploadedFiles.length > 0) {
      processUploadedFiles(uploadedFiles);
    }
  }, [location.state]);

  const countPDFPages = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      return pdf.getPageCount();
    } catch (error) {
      console.error('Error counting PDF pages:', error);
      throw new Error('Failed to count PDF pages');
    }
  };

  const countDOCXPages = async (file: File): Promise<number> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/count-docx-pages', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to count DOCX pages');
    }

    const data = await response.json();
    return data.pageCount;
  };

  const processUploadedFiles = async (uploadedFiles: File[]) => {
    setLoading(true);
    setError('');
    setFiles(uploadedFiles);

    try {
      let totalPages = 0;
      for (const file of uploadedFiles) {
        const pages = file.type === 'application/pdf' 
          ? await countPDFPages(file)
          : await countDOCXPages(file);
        totalPages += pages;
      }
      setPageCount(totalPages);
    } catch (error) {
      setError(error.message || 'Error processing files');
      setFiles([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const totalPages = doubleSided ? Math.ceil(pageCount / 2) : pageCount;
    return totalPages * copies * (printType === 'bw' ? prices.bw : prices.color);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    const orderData = {
      files,
      pageCount,
      printType,
      copies,
      doubleSided,
      totalAmount: calculateTotal()
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      // Handle response and redirect to payment gateway
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPageCount(0);
    setPrintType('bw');
    setCopies(1);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Print Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            
            {files.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Input
                  type="file" 
                  accept=".pdf,.docx"
                  multiple
                  onChange={(e) => {
                    const uploadedFiles = Array.from(e.target.files || []);
                    if (uploadedFiles.length > 0) {
                      processUploadedFiles(uploadedFiles);
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {loading ? 'Processing...' : 'Click to upload PDF or DOCX files'}
                  </p>
                  {loading && (
                    <div className="mt-2">  
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Uploaded Files</label>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="bg-gray-100 p-2 rounded-lg">
                        {file.name} ({file.type === 'application/pdf' ? 'PDF' : 'DOCX'})
                      </div>
                    ))}
                  </div>
                </div>

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

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Copies</label>
                  <Input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={doubleSided}
                    onChange={(e) => setDoubleSided(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Double-sided printing</label>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-700">Total Document Pages: {pageCount}</p>
                  <p className="text-lg font-semibold mt-2">
                    Total Price: ₹{calculateTotal()}
                  </p>
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="w-full ml-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}  
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderPage;