import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Upload, X, Plus } from 'lucide-react';
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
  const [pageCountMap, setPageCountMap] = useState<Map<string, number>>(new Map());

  const prices = {
    bw: 2,   // Price per page for black & white
    color: 8 // Price per page for color
  };

  // Only process location state files on initial mount
  useEffect(() => {
    const uploadedFiles = location.state?.uploadedFiles;
    if (uploadedFiles && uploadedFiles.length > 0 && files.length === 0) {
      handleFileAddition(uploadedFiles);
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Update total page count whenever pageCountMap changes
    const total = Array.from(pageCountMap.values()).reduce((sum, count) => sum + count, 0);
    setPageCount(total);
  }, [pageCountMap]);

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

  const handleFileAddition = async (newFiles: File[]) => {
    setLoading(true);
    setError('');
    
    try {
      // Get unique files by creating a Map with file key as the key
      const uniqueFilesMap = new Map();
      newFiles.forEach(file => {
        const fileKey = file.name + file.lastModified;
        if (!files.some(existingFile => existingFile.name + existingFile.lastModified === fileKey)) {
          uniqueFilesMap.set(fileKey, file);
        }
      });

      const uniqueNewFiles = Array.from(uniqueFilesMap.values());
      
      if (uniqueNewFiles.length === 0) {
        setError('These files have already been added');
        setLoading(false);
        return;
      }

      const newPageCounts = new Map(pageCountMap);
      
      for (const file of uniqueNewFiles) {
        const pages = file.type === 'application/pdf' 
          ? await countPDFPages(file)
          : await countDOCXPages(file);
        newPageCounts.set(file.name + file.lastModified, pages);
      }
      
      setPageCountMap(newPageCounts);
      setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
    } catch (error) {
      setError(error.message || 'Error processing files');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length > 0) {
      handleFileAddition(newFiles);
    }
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = files[indexToRemove];
    const fileKey = fileToRemove.name + fileToRemove.lastModified;
    
    // Update files array
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    
    // Update page count map
    setPageCountMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.delete(fileKey);
      return newMap;
    });
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
    setPageCountMap(new Map());
    setPrintType('bw');
    setCopies(1);
    setDoubleSided(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
            <CardTitle className="text-2xl">Print Settings ⚙️</CardTitle>
            </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Upload Files</label>
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    multiple
                    onChange={handleAddFiles}
                    className="hidden"
                    id="add-files"
                  />
                  <label
                    htmlFor="add-files"
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Files
                  </label>
                </div>

                {loading && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Processing files...</p>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {files.map((file, index) => (
                      <div key={file.name + file.lastModified} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                        <span className="text-sm">
                          {file.name} ({file.type === 'application/pdf' ? 'PDF' : 'DOCX'})
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-8 w-8 p-0 hover:bg-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length === 0 && !loading && (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click 'Add Files' to upload PDF or DOCX files
                    </p>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderPage;