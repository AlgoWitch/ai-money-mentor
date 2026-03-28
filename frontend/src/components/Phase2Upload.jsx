import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

export default function Phase2Upload({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileStatus, setFileStatus] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setFileStatus("Reading file...");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setFileStatus("Analyzed");
      onUpload(text, false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex justify-start w-full mb-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-ql-bg flex items-center justify-center text-ql-dark">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-ql-dark">Verify Income 📑</h3>
            <p className="text-xs text-slate-500">Upload statement or paste SMS</p>
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging ? 'border-ql-primary bg-ql-primary/5' : 'border-slate-200 hover:border-slate-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {fileStatus === "Analyzed" ? (
             <div className="flex flex-col items-center gap-2 text-green-600">
                <CheckCircle size={32} />
                <span className="text-sm font-medium">Document Verified</span>
             </div>
          ) : (
            <>
              <UploadCloud size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-2">Drag & drop your statement</p>
              <p className="text-xs text-slate-400 mb-4">Supports .txt, .csv</p>
              
              <label className="bg-ql-dark text-white text-sm px-4 py-2 rounded-xl cursor-pointer hover:bg-black transition-colors">
                Browse Files
                <input type="file" className="hidden" accept=".txt,.csv" onChange={handleChange} />
              </label>
            </>
          )}
        </div>
        
        <div className="mt-4 text-center">
           <p className="text-xs text-slate-400 mb-2">OR Paste SMS in the chat box below 👇</p>
        </div>
      </div>
    </div>
  );
}
