import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../components/ui/button";

export default function PreviewPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [copies, setCopies] = useState(1);
    const [color, setColor] = useState("B&W");
    const [orientation, setOrientation] = useState("Portrait");
    const pricePerPage = color === "B&W" ? 3 : 10;
    const totalPrice = pricePerPage * copies * files.length;

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/pdf': [],
            'image/*': []
        },
        onDrop: (acceptedFiles) => {
            setFiles([...files, ...acceptedFiles]);
        },
    });

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
      };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-center mb-4">Print Preview</h1>

            <div className="flex gap-4">
                {/* File Preview */}
                <div className="flex flex-wrap gap-4">
                    {files.map((file, index) => (
                        <div key={index} className="border p-2 w-32">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                className="w-full h-40 object-cover"
                            />
                            <p className="text-xs text-center">{file.name}</p>
                        
                        </div>
                    ))}
                    <div
                        {...getRootProps()}
                        className="border border-dashed p-4 w-32 flex items-center justify-center"
                    >
                        <input {...getInputProps()} />
                        <p className="text-sm text-gray-500">Add File</p>
                        
                    </div>
                </div>

                {/* Print Settings */}
                <div className="p-4 bg-white shadow-lg rounded-lg w-80">
                    <h2 className="font-semibold">Print Settings</h2>

                    <div className="mt-3">
                        <label className="text-sm">Choose number of copies</label>
                        <div className="flex items-center border p-2 rounded-md">
                            <button
                                className="px-3"
                                onClick={() => setCopies(Math.max(1, copies - 1))}
                            >
                                -
                            </button>
                            <span className="px-4">{copies}</span>
                            <button className="px-3" onClick={() => setCopies(copies + 1)}>
                                +
                            </button>
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="text-sm">Choose print color</label>
                        <div className="flex gap-4">
                            <button
                                className={`p-2 border rounded-md ${
                                    color === "B&W" ? "bg-green-500 text-white" : ""
                                }`}
                                onClick={() => setColor("B&W")}
                            >
                                B&W ₹3/page
                            </button>
                            <button
                                className={`p-2 border rounded-md ${
                                    color === "Color" ? "bg-green-500 text-white" : ""
                                }`}
                                onClick={() => setColor("Color")}
                            >
                                Color ₹10/page
                            </button>
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="text-sm">Choose print orientation</label>
                        <div className="flex gap-4">
                            <button
                                className={`p-2 border rounded-md ${
                                    orientation === "Portrait" ? "bg-green-500 text-white" : ""
                                }`}
                                onClick={() => setOrientation("Portrait")}
                            >
                                Portrait
                            </button>
                            <button
                                className={`p-2 border rounded-md ${
                                    orientation === "Landscape" ? "bg-green-500 text-white" : ""
                                }`}
                                onClick={() => setOrientation("Landscape")}
                            >
                                Landscape
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 p-3 bg-green-100 rounded-md">
                        <p className="font-semibold">Total: ₹{totalPrice}</p>
                    </div>

                    <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-md">
                        View Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
