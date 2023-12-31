export async function scaleContent(snapshot, scaleFactor, PDFLib) {
    // Load the original PDF file
    const pdfDoc = await PDFLib.PDFDocument.load(snapshot, {
        parseSpeed: PDFLib.ParseSpeeds.Fastest,
    });

    const pages = pdfDoc.getPages();

    pages.forEach(page => {
        const width = page.getWidth();
        const height = page.getHeight();
        
        // Scale content
        page.scaleContent(scaleFactor, scaleFactor);
        const scaled_diff = {
            width: Math.round(width - scaleFactor * width),
            height: Math.round(height - scaleFactor * height),
        };

        // Center content in new page format
        page.translateContent(Math.round(scaled_diff.width / 2), Math.round(scaled_diff.height / 2));

    });

    // Serialize the modified document
    return pdfDoc.save();
};