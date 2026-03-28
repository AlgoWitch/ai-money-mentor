import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

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

  const handleFile = async (file) => {
    setFileStatus("Reading file...");
    
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
       try {
          const res = await api.extractPdf(file);
          if (res.text) {
             setFileStatus("Analyzed");
             onUpload(res.text, false);
          } else {
             setFileStatus("Error: " + (res.message || "Failed to parse PDF"));
          }
       } catch (err) {
          const errMsg = err.response?.data?.detail || "Unreadable PDF";
          setFileStatus("Error: " + errMsg);
       }
       return;
    }
    
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
          ) : fileStatus === "Reading file..." ? (
             <div className="flex flex-col items-center gap-4 text-ql-dark py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ql-dark"></div>
                <span className="text-sm font-bold">Uploading & Processing PDF...</span>
             </div>
          ) : (
            <>
              <UploadCloud size={32} className={`mx-auto mb-3 ${fileStatus?.startsWith("Error") ? 'text-red-400' : 'text-slate-400'}`} />
              
              {fileStatus?.startsWith("Error") ? (
                  <p className="text-sm text-red-500 font-bold mb-2">{fileStatus}</p>
              ) : (
                  <p className="text-sm text-slate-600 mb-2">Drag & drop your statement</p>
              )}
              
              <p className="text-xs text-slate-400 mb-4">Supports .pdf, .txt, .csv</p>
              
              <label className="bg-ql-dark text-white text-sm px-4 py-2 rounded-xl cursor-pointer hover:bg-black transition-colors">
                Browse Files
                <input type="file" className="hidden" accept=".pdf,.txt,.csv" onChange={handleChange} />
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
