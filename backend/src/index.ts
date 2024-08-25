import express, { Request, Response } from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Promisify exec for easier use with async/await
const execPromise = util.promisify(exec);

// Function to convert PDF to images using pdftoppm
const convertPdfToImages = async (pdfBuffer: Buffer): Promise<string[]> => {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const pdfPath = path.join(outputDir, 'temp.pdf');
  fs.writeFileSync(pdfPath, pdfBuffer);

  try {
    // Convert PDF to PNG images
    const { stdout } = await execPromise(`pdftoppm -png ${pdfPath} ${path.join(outputDir, 'page')}`);
    const imagePaths = stdout.split('\n').filter(file => file.endsWith('.png'));
    return imagePaths;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  } finally {
    // Clean up the temporary PDF file
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
  }
};

// Function to clean up images
const cleanUpImages = (imagePaths: string[]) => {
  imagePaths.forEach(imagePath => {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
};

// OCR Endpoint
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const fileBuffer = req.file.buffer;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const imagePaths = await convertPdfToImages(fileBuffer);

      for (const imagePath of imagePaths) {
        const result = await Tesseract.recognize(imagePath, 'eng');
        extractedText += result.data.text;
      }
          
      // Clean up the images after processing
      cleanUpImages(imagePaths);
    } else {
      const result = await Tesseract.recognize(fileBuffer, 'eng');
      extractedText = result.data.text;
    }

    res.json({ extractedData: extractedText });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
