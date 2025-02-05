import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../components/ui/button";
import { X, Upload } from "lucide-react";

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* File Upload Box */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center bg-white hover:bg-gray-50 cursor-pointer flex flex-col items-center"
      >
        <input {...getInputProps()} />
        {/* Uploaded Image */}
        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500 mt-2">
          Click to upload <span className="font-semibold text-blue-500">PDF</span> or{" "}
          <span className="font-semibold text-blue-500">DOCX</span> file
        </p>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Files to Print</h3>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {files.map((file, index) => (
              <div key={index} className="relative p-2 border rounded-lg shadow-md bg-white">
                <div className="flex items-center justify-center h-32 bg-gray-200 text-gray-700 font-semibold">
                  {file.type === "application/pdf" ? "PDF" : "DOCX"}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>

                <p className="text-xs mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proceed Button */}
      {files.length > 0 && (
        <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          Proceed to Print
        </Button>
      )}
    </div>
  );
}
