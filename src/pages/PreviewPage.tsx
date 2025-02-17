import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../components/ui/button";
import { X, Upload, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

export default function FileUploader() {
  const [files, setFiles] = useState<{file: File, previewUrl: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => {
        const previewUrl = file.type === 'application/pdf' 
          ? URL.createObjectURL(file) 
          : '';
        return { file, previewUrl };
      });
      setFiles([...files, ...newFiles]);
    },
  });

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleProceed = () => {
    if (files.length > 0) {
      setIsLoading(true); // Show loading screen
      setTimeout(() => {
        setIsLoading(false);
        navigate('/order', { 
          state: { 
            uploadedFiles: files.map(f => f.file) 
          } 
        });
      }, 2000); // 2 second delay
    }
  };

  const [previewModal, setPreviewModal] = useState<{previewUrl: string, index: number} | null>(null);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center bg-white hover:bg-gray-50 cursor-pointer flex flex-col items-center"
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500 mt-2">
          Click to upload <span className="font-semibold text-blue-500">PDF</span> or{" "}
          <span className="font-semibold text-blue-500">DOCX</span> file
        </p>
      </div>

      {/* Add Loading Screen */}
      {isLoading && <LoadingScreen />}


      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Files to Print</h3>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {files.map((fileItem, index) => (
              <div key={index} className="relative p-2 border rounded-lg shadow-md bg-white">
                <div className="flex items-center justify-center h-32 bg-gray-200 text-gray-700 font-semibold">
                  {fileItem.file.type === "application/pdf" ? (
                    <iframe
                      src={fileItem.previewUrl + "#toolbar=0"}
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <span>DOCX</span>
                  )}
                </div>

                <div className="absolute top-1 right-1 flex space-x-1">
                  {fileItem.previewUrl && (
                    <button
                      onClick={() => setPreviewModal({previewUrl: fileItem.previewUrl, index})}
                      className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs mt-1 truncate">{fileItem.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl w-full max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">File Preview</h2>
              <button 
                onClick={() => setPreviewModal(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              <iframe
                src={previewModal.previewUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
                className="w-full h-full"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      {files.length > 0 && (
        <Button 
          onClick={handleProceed}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Proceed to Print
        </Button>
      )}
    </div>
  );
}