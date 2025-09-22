
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { NoteDisplay } from './components/NoteDisplay';
import { FontSelector } from './components/FontSelector';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { processPdf } from './services/pdfProcessor';
import { generateNotesFromGemini } from './services/geminiService';
import { saveAsPdf } from './services/pdfGenerator';
import { FontOption } from './types';
import { FONT_OPTIONS } from './constants';

interface DisplayImage {
    src: string | null;
    description: string;
}

const App: React.FC = () => {
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
    const [extractedImages, setExtractedImages] = useState<string[]>([]);
    const [displayData, setDisplayData] = useState<DisplayImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFont, setSelectedFont] = useState<FontOption>(FONT_OPTIONS[0]);

    const handlePdfFileSelect = (files: File[]) => {
        setPdfFiles(files);
    };

    const handleAudioFileSelect = (files: File[]) => {
        setAudioFiles(files);
    };

    const handleGenerateNotes = useCallback(async () => {
        if (pdfFiles.length === 0 || audioFiles.length === 0) {
            setError("강의 자료(PDF)와 강의 녹음(오디오) 파일을 모두 업로드해주세요.");
            return;
        }

        setError(null);
        setIsLoading(true);
        setGeneratedNotes(null);
        setExtractedImages([]);
        setDisplayData([]);

        try {
            // Step 1: Extract text and images from all provided PDFs
            let combinedPdfText = '';
            const allImages: string[] = [];
            for (const pdfFile of pdfFiles) {
                const { text, images } = await processPdf(pdfFile);
                combinedPdfText += text + '\n\n'; // Add separator for context
                allImages.push(...images);
            }
            setExtractedImages(allImages);

            // Step 2: Simulate audio transcription for all provided audio files
            const mockTranscripts = [
                `교수님께서는 광합성의 핵심 개념을 강조하시면서, 명반응과 암반응에 대해 설명하셨습니다. 중요한 점은 빛 에너지를 포착하는 엽록소의 역할이었습니다. 또한 크렙스 회로가 세포 호흡의 중요한 부분이며, 이는 다음 강의의 주제라고 언급하셨습니다. 학생들은 슬라이드에 있는 엽록체 그림에 집중해야 합니다.`,
                `두 번째 강의에서는 세포 호흡의 세부 과정, 특히 해당과정과 TCA 회로에 대해 더 깊이 들어갔습니다. ATP가 어떻게 생성되는지 분자 수준에서 설명하셨고, 미토콘드리아의 구조가 이 과정에서 얼마나 중요한지 강조하셨습니다. 슬라이드 4번의 미토콘드리아 다이어그램은 시험에 나올 확률이 높다고 하셨습니다.`
            ].slice(0, audioFiles.length); // Use up to N mock transcripts based on uploaded files
            
            // Step 3: Generate notes using Gemini, which will include image instructions
            const noteData = await generateNotesFromGemini(combinedPdfText, mockTranscripts, allImages);

            // Step 4: Prepare images based on Gemini's instructions (using full pages, no cropping)
            const newDisplayData = noteData.images.map(imgInstruction => {
                const sourceImg = allImages[imgInstruction.sourceImageIndex];
                return {
                    src: sourceImg ?? null, // Use the full source image
                    description: imgInstruction.description,
                };
            });

            setDisplayData(newDisplayData);
            setGeneratedNotes(noteData.note);

        } catch (err) {
            console.error("Error generating notes:", err);
            setError("노트를 생성하는 중 오류가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    }, [pdfFiles, audioFiles]);
    
    const handleDownloadPdf = () => {
        saveAsPdf('note-display-area', 'lecture-notes.pdf');
    };

    return (
        <div className="min-h-screen text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <Header />
                <main className="mt-10 bg-white rounded-2xl shadow-xl p-8 md:p-12">
                     <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">파일 업로드</h2>
                            <p className="text-gray-500 mb-6">강의 자료와 녹음 파일을 올려주세요.</p>
                            <div className="flex flex-col md:flex-row gap-6">
                                <FileUploader
                                    label="강의 자료 (PDF)"
                                    acceptedTypes=".pdf"
                                    onFileSelect={handlePdfFileSelect}
                                    fileType="pdf"
                                />
                                 <FileUploader
                                    label="강의 녹음"
                                    acceptedTypes="audio/*"
                                    onFileSelect={handleAudioFileSelect}
                                    fileType="audio"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                                <p className="font-bold">오류</p>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="text-center pt-4">
                            <Button onClick={handleGenerateNotes} disabled={isLoading || pdfFiles.length === 0 || audioFiles.length === 0}>
                                {isLoading ? '노트 생성 중...' : '노트 생성하기'}
                            </Button>
                        </div>
                    </div>

                    {isLoading && <Spinner message="AI가 노트를 정리하고 있습니다..." />}

                    {generatedNotes && (
                        <div className="mt-12 border-t pt-10">
                            <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">생성된 노트</h2>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                                <FontSelector
                                    options={FONT_OPTIONS}
                                    selected={selectedFont}
                                    onSelect={setSelectedFont}
                                />
                                <Button onClick={handleDownloadPdf} variant="secondary">
                                    PDF로 다운로드
                                </Button>
                            </div>
                            <NoteDisplay
                                notes={generatedNotes}
                                images={displayData}
                                fontClassName={selectedFont.className}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
