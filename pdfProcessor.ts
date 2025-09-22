// This file uses the pdfjs-dist library, which is loaded via a CDN in index.html.
// We declare the global variable to satisfy TypeScript.
declare const pdfjsLib: any;

/**
 * Extracts all text content and images from a PDF file.
 * @param file The PDF file to process.
 * @returns A promise that resolves to an object containing the text and an array of image data URLs.
 */
export const processPdf = async (file: File): Promise<{ text: string; images: string[] }> => {
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
        fileReader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file."));
            }

            try {
                const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                
                let fullText = '';
                const images: string[] = [];
                const imagePromises: Promise<void>[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';

                    // For image extraction, we render the page to a canvas and export it.
                    // To avoid title pages, we start extracting images from page 3. We process up to 5 pages (e.g., 3 to 7) to balance performance.
                    if (i >= 3 && i <= 7) {
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        if (context) {
                           await page.render({ canvasContext: context, viewport: viewport }).promise;
                           images.push(canvas.toDataURL('image/jpeg', 0.8));
                        }
                    }
                }
                
                await Promise.all(imagePromises);
                resolve({ text: fullText, images });

            } catch (error) {
                console.error('Error processing PDF:', error);
                reject(new Error('Could not process the PDF file. It might be corrupted or protected.'));
            }
        };

        fileReader.onerror = (error) => {
            reject(error);
        };

        fileReader.readAsArrayBuffer(file);
    });
};