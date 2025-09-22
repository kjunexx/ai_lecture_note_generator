
import React, { useState, useCallback } from 'react';

interface FileUploaderProps {
    label: string;
    acceptedTypes: string;
    onFileSelect: (files: File[]) => void;
    fileType: 'pdf' | 'audio';
}

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AudioIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

export const FileUploader: React.FC<FileUploaderProps> = ({ label, acceptedTypes, onFileSelect, fileType }) => {
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) {
            setFileNames([]);
            onFileSelect([]);
            return;
        }

        const acceptedFiles: File[] = [];
        const acceptedFileNames: string[] = [];
        const allowedTypes = acceptedTypes.split(',').map(t => t.trim());

        Array.from(files).forEach(file => {
            const fileType = file.type;
            const fName = file.name;
            const isAccepted = allowedTypes.some(type => {
                if (type.startsWith('.')) {
                    return fName.toLowerCase().endsWith(type);
                }
                if (type.endsWith('/*')) {
                    return fileType.startsWith(type.slice(0, -1));
                }
                return fileType === type;
            });

            if (isAccepted) {
                acceptedFiles.push(file);
                acceptedFileNames.push(file.name);
            } else {
                alert(`'${file.name}'은(는) 지원하지 않는 파일 형식입니다. 다음 중 하나를 업로드해주세요: ${acceptedTypes}`);
            }
        });

        setFileNames(acceptedFileNames);
        onFileSelect(acceptedFiles);

    }, [onFileSelect, acceptedTypes]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(event.target.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
    }, [handleFiles]);

    return (
        <div className="w-full min-w-0">
            <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div 
                className={`relative flex flex-col items-center justify-center w-full h-48 p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105' : 'hover:border-indigo-400'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input id={label} name={label} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept={acceptedTypes} onChange={handleFileChange} multiple />
                
                {fileNames.length > 0 ? (
                    <div className="w-full text-center overflow-y-auto max-h-full">
                         <span className="text-green-600 font-bold">{fileNames.length}개 파일 선택됨</span>
                         <ul className="mt-2 text-xs text-gray-600 list-none space-y-1">
                             {fileNames.map((name, index) => <li key={`${name}-${index}`} className="truncate">{name}</li>)}
                         </ul>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        {fileType === 'pdf' ? <PdfIcon /> : <AudioIcon />}
                        <p className="text-sm text-gray-600">
                           <span className="font-semibold text-indigo-600">파일 업로드</span> 또는 드래그 앤 드롭
                        </p>
                        <p className="text-xs text-gray-500">{acceptedTypes === '.pdf' ? 'PDF 파일' : 'MP3, M4A, WAV'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};