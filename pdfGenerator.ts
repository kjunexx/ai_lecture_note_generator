
// This file uses jspdf and html2canvas, which are loaded via CDN in index.html.
// We declare the global variables to satisfy TypeScript.
declare const jspdf: any;
declare const html2canvas: any;

/**
 * Saves a specified HTML element as a PDF file.
 * @param elementId The ID of the HTML element to capture.
 * @param fileName The desired name for the downloaded PDF file.
 */
export const saveAsPdf = (elementId: string, fileName: string): void => {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }

    // Use html2canvas to render the element into a canvas
    html2canvas(element, {
        scale: 2, // Increase scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff', // Set a white background
    }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        
        // PDF dimensions (A4 size: 210mm x 297mm)
        const pdfWidth = 210;
        const pdfHeight = 297;

        // Image dimensions
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate the ratio to fit the image within the PDF page
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

        // Position the image in the center of the PDF page
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Margin from top

        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        pdf.save(fileName);
    }).catch((error: any) => {
        console.error("Error generating PDF:", error);
    });
};
