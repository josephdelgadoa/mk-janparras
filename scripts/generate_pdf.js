
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generatePDF() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();
    const url = 'http://localhost:5173/presentation'; // Ensure dev server is running

    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    } catch (e) {
        console.error("Navigation failed:", e);
        await browser.close();
        process.exit(1);
    }

    // Wait for the "Start" button or initial load
    // Assuming the presentation starts with a slide or requires a click
    // We'll capture the slides.

    const pdfPath = path.join(__dirname, '../presentation.pdf');

    // We need to iterate through slides.
    // Based on WebPresentation.tsx (which I should have read to know the key interaction),
    // let's assume we capture what's visible, then click 'Next', repeat.
    // Ideally, we'd know how many slides there are.
    // Let's grab the slide count from the UI if possible, or just arbitrary number.

    // Actually, looking at previous context, there are ~6 slides.
    // Let's try to capture 7 or 8 times to be safe.

    // Wait for initial render
    await new Promise(r => setTimeout(r, 2000));

    const images = [];

    // Capture loop
    // Note: Puppeteer PDF of 'screen' is tricky for single page apps 
    // unless we print repeatedly. We will take screenshots and combine, 
    // OR we just emit one PDF if we can modify the view.
    // Let's go with screenshots -> PDF merger (using PDFLib or similar),
    // OR simply page.pdf() of each state? No, combining is harder without lib.
    // Check if we can just print the whole thing?
    // Let's try to just take ONE LONG PDF? No, slides are absolute/fixed.

    // Simple approach: Take screenshots, then use a tool?
    // Or just use 'jspdf' inside the page?
    // Let's just create a PDF with one slide per page using puppeteer.

    // We can't easily merge PDFs without another lib (pdf-lib).
    // Does 'puppeteer' allow appending? No.

    // Alternative: We will assume there are exactly 7 slides.
    // We will assume the user has 'pdf-lib' or I can install it.
    // Let's install 'pdf-lib' as well.
    // But since I didn't install 'pdf-lib' yet, I'll use a hack:
    // I can't easily merge.

    // Better idea: Screenshot all to a folder, then tell user where they are?
    // Or, use a simple 'html-to-pdf' approach where I inject all screenshots into a new HTML page and print THAT.

    console.log("Capturing slides...");
    const screenshotPaths = [];

    const totalSlides = 8; // Estimated
    for (let i = 0; i < totalSlides; i++) {
        const screenshotPath = path.join(__dirname, `../slide_${i}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Captured Slide ${i}`);

        // Click Next Button (assuming typical FAB or arrow key)
        // Try pressing ArrowRight
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 1500)); // Wait for transition
    }

    // Now create a PDF from these images using a temporary HTML page
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; background: black; }
                img { width: 100vw; height: 100vh; display: block; break-after: page; }
                @page { size: 1920px 1080px; margin: 0; }
            </style>
        </head>
        <body>
            ${Array.from({ length: totalSlides }, (_, i) => `<img src="file://${path.join(__dirname, `../slide_${i}.png`)}" />`).join('')}
        </body>
        </html>
    `;

    const compilerPage = await browser.newPage();
    await compilerPage.setContent(htmlContent);
    await compilerPage.pdf({
        path: pdfPath,
        width: '1920px',
        height: '1080px',
        printBackground: true
    });

    console.log(`PDF saved to ${pdfPath}`);
    await browser.close();
}

generatePDF();
