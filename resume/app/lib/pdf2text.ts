// Function to extract text from PDF using pdfjs-dist
let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

export async function extractTextFromPdf(file: File | Blob): Promise<string> {
    try {
        const lib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        const numPages = pdf.numPages;
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }
        
        return fullText.trim();
    } catch (err) {
        console.error('Error extracting text from PDF:', err);
        throw new Error('Failed to extract text from PDF');
    }
}

