import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

interface ProcessingScreenProps {
  files: File[];
  onCancel: () => void;
  onComplete: (processedFiles: File[]) => void;
}

export const ProcessingScreen = ({ files, onCancel, onComplete }: ProcessingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const startProcessing = async () => {
      await new Promise(r => setTimeout(r, 3000)); // 3-second delay before processing
      if (isCancelled) return;
      setLoading(false);

      const totalFiles = files.length;
      const processedFiles: File[] = [];

      for (let i = 0; i < totalFiles; i++) {
        if (isCancelled) return;

        const file = files[i];
        setCurrentFile(file.name);

        for (let j = 0; j < 100; j++) {
          if (isCancelled) break;
          await new Promise(r => setTimeout(r, 20));
          const fileProgress = j;
          const overallProgress = Math.floor((i * 100 + fileProgress) / totalFiles);
          setProgress(overallProgress);
        }

        processedFiles.push(file);
      }

      if (!isCancelled) {
        setProgress(100);
        setTimeout(() => onComplete(processedFiles), 30000);
      }
    };

    startProcessing();

    return () => {
      isCancelled = true;
    };
  }, [files, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{loading ? 'Preparing to Process' : 'Processing Files'}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="hover:bg-red-100"
          >
            <X className="w-4 h-4 text-red-500" />
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-sm text-gray-600">
              Initializing... Please wait.
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600">Processing: {currentFile}</div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{progress}% Complete</span>
                <span>{files.length} Files</span>
              </div>
              <div className="text-center text-sm text-gray-500">
                Please wait while we process your files...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
