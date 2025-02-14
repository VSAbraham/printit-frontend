import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Upload, X, Plus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface FilePreferences {
  printType: 'bw' | 'color';
  copies: number;
  doubleSided: boolean;
}

interface FileWithPreferences {
  file: File;
  pageCount: number;
  preferences: FilePreferences;
}

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filesWithPrefs, setFilesWithPrefs] = useState<FileWithPreferences[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const prices = {
    bw: 2,   // Price per page for black & white
    color: 8 // Price per page for color
  };

 // Monitor filesWithPrefs and navigate to preview if no files are present
  useEffect(() => {
    if (filesWithPrefs.length === 0 && !loading) {
      const timer = setTimeout(() => {
        navigate('/preview', { replace: true });
      }, 100); // Small delay to ensure state is settled
      
      return () => clearTimeout(timer);
    }
  }, [filesWithPrefs, loading]);

  // Redirect to preview if no files are present
  useEffect(() => {
    if (!loading && filesWithPrefs.length === 0 && !location.state?.uploadedFiles) {
      navigate('/preview', { replace: true });
    }
  }, [filesWithPrefs, loading, location.state, navigate]);
  
  // Only process location state files on initial mount
  var addedPreviousFiles = false;
  useEffect(() => {
    const uploadedFiles = location.state?.uploadedFiles;
    if (!addedPreviousFiles && uploadedFiles && uploadedFiles.length > 0 && filesWithPrefs.length === 0) {
      addedPreviousFiles = true;
      handleFileAddition(uploadedFiles);
    }
  }, []);

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
      const uniqueNewFiles = newFiles.filter(newFile => 
        !filesWithPrefs.some(existing => 
          existing.file.name + existing.file.lastModified === newFile.name + newFile.lastModified
        )
      );
      
      if (uniqueNewFiles.length === 0) {
        setError('These files have already been added');
        setLoading(false);
        return;
      }

      const newFilesWithPrefs = await Promise.all(
        uniqueNewFiles.map(async file => {
          const pageCount = file.type === 'application/pdf' 
            ? await countPDFPages(file)
            : await countDOCXPages(file);

          return {
            file,
            pageCount,
            preferences: {
              printType: 'bw' as const,
              copies: 1,
              doubleSided: false
            }
          };
        })
      );
      
      setFilesWithPrefs(prev => [...prev, ...newFilesWithPrefs]);
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
    event.target.value = '';
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFilesWithPrefs(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateFilePreferences = (index: number, updates: Partial<FilePreferences>) => {
    setFilesWithPrefs(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, preferences: { ...item.preferences, ...updates } }
        : item
    ));
  };

  const calculateFileTotal = (file: FileWithPreferences) => {
    const totalPages = file.preferences.doubleSided 
      ? Math.ceil(file.pageCount / 2) 
      : file.pageCount;
    return totalPages * file.preferences.copies * 
      (file.preferences.printType === 'bw' ? prices.bw : prices.color);
  };

  const calculateTotal = () => {
    return filesWithPrefs.reduce((sum, file) => sum + calculateFileTotal(file), 0);
  };

  const handleSubmit = async () => {
    if (filesWithPrefs.length === 0) return;

    const orderData = {
      files: filesWithPrefs.map(f => ({
        file: f.file,
        pageCount: f.pageCount,
        preferences: f.preferences,
        subtotal: calculateFileTotal(f)
      })),
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
    setFilesWithPrefs([]);
    setError('');
    navigate('/preview', { replace: true });
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

                {filesWithPrefs.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {filesWithPrefs.map((fileWithPref, index) => (
                      <div key={fileWithPref.file.name + fileWithPref.file.lastModified} 
                           className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">
                            {fileWithPref.file.name}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-1">Print Type</label>
                            <select
                              value={fileWithPref.preferences.printType}
                              onChange={(e) => updateFilePreferences(index, { 
                                printType: e.target.value as 'bw' | 'color' 
                              })}
                              className="w-full border rounded-lg p-2 text-sm"
                            >
                              <option value="bw">Black & White (₹2/page)</option>
                              <option value="color">Color (₹8/page)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm mb-1">Copies</label>
                            <Input
                              type="number"
                              min="1"
                              value={fileWithPref.preferences.copies}
                              onChange={(e) => updateFilePreferences(index, { 
                                copies: parseInt(e.target.value) || 1 
                              })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="flex items-center space-x-2">
                            <Input
                              type="checkbox"
                              checked={fileWithPref.preferences.doubleSided}
                              onChange={(e) => updateFilePreferences(index, { 
                                doubleSided: e.target.checked 
                              })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Double-sided printing</span>
                          </label>
                        </div>
                        
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-700">Pages: {fileWithPref.pageCount}</p>
                          <p className="text-sm font-medium mt-1">
                            Subtotal: ₹{calculateFileTotal(fileWithPref)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filesWithPrefs.length === 0 && !loading && (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click 'Add Files' to upload PDF or DOCX files
                    </p>
                  </div>
                )}
              </div>

              {filesWithPrefs.length > 0 && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold">
                      Total Order Price: ₹{calculateTotal()}
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