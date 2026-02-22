import fs from 'fs/promises'
import { PDFParse } from 'pdf-parse'


/**
 * EXTRACT TEXT FROM PDF FILE
 * @param {string} filePath - path to pdf file
 * @return {Promise<{text: String, numPages: number}>}
 */

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath)

        //PDF-parse exports a Uint8Array, not a buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer))
        const data = await parser.getText()

        return{
            text: data.text,
            numPages: data.numPages,
            info: data.info,
        }
    } catch (error) {
        console.error('PDF parsing error:', error)
        throw new Error("Failed to extact text from PDF")
    }
}