import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Upload, FileText, Settings } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const OrderPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setLoading(true);
    setError('');
    setFile(uploadedFile);

    try {
      // Create preview URL for PDF files
      if (uploadedFile.type === 'application/pdf') {
        const previewUrl = URL.createObjectURL(uploadedFile);
        setFilePreviewUrl(previewUrl);
        const pages = await countPDFPages(uploadedFile);
        setPageCount(pages);
      } 
      // Handle DOCX files
      else if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const pages = await countDOCXPages(uploadedFile);
        setPageCount(pages);
      } 
      else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }
    } catch (error) {
      setError(error.message || 'Error processing file');
      setFile(null);
      setFilePreviewUrl('');
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const basePrice = pageCount * prices[printType];
    const totalPages = doubleSided ? Math.ceil(pageCount / 2) : pageCount;
    return totalPages * copies * (printType === 'bw' ? prices.bw : prices.color);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const orderData = {
      file,
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
    setFile(null);
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
            <CardTitle>Upload your files</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            
            {!file ? (
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
                    {loading ? 'Processing...' : 'Click to upload PDF or DOCX file'}
                  </p>
                  {loading && (
                    <div className="mt-2">  
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">
                    <FileText className="w-4 h-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Print Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="mt-4">
                  {filePreviewUrl ? (
                    <div className="w-full h-96">
                      <iframe
                        src={filePreviewUrl}
                        className="w-full h-full border rounded-lg"
                        title="Document Preview"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Preview not available for DOCX files</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4">
                  <div className="space-y-6">
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
                      <p className="text-blue-700">Document Pages: {pageCount}</p>
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
                </TabsContent>
              </Tabs>
            )}  
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderPage;