/**
 * Split text into chunks for better AI processing
 * @param {string} text - full text to chunk
 * @param {number} chunkSize - target size per chunk(in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns  {Array<{ content: string, chunkIndex: number, pageNumber: number}>}
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || text.trim().length === 0) {
        return []
    }

    //CLEAN TEXT WHILE PRESERVING PARAGRAPH STRUCTURE
    const cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .replace(/\n /g, '\n')
        .replace(/ \n/g, '\n')
        .trim()

    // Try to split by paragraphs (single or double newlines)
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0)

    const chunks = []
    let currentChunk = []
    let currentWordCount = 0
    let chunkIndex = 0

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/)
        const paragraphWordCount = paragraphWords.length

        //If single paragraph exceeds chunks size, split it by words
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                })
                currentChunk = []
                currentWordCount = 0
            }
        }

        // split large paragraph into word-based chunks 
        for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
            const chunkWords = paragraphWords.slice(i, i + chunkSize)
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            })

            if (i + chunkSize >= paragraphWords.length) break
        }
        continue
    }

    //If adding this paragraph exceeds chunk size, save current chunk
    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: 0
        })

        //Create overlap from previous chunk
        const prevChunkTest = currentChunk.join(" ")
        const prevWords = prevChunkTest.split(/\s+/)
        const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ')

        currentChunk = [overlapText, paragraphs.trim()]
        currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount
    } else {
        //Add paragraph to current chuunk
        currentChunk.push(paragraph.trim())
        currentWordCount += paragraphWordCount
    }

    //Add the last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: 0
        })
    }

    //Fallback : If no chunks created , split by words
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/)

        for (let i = 0; i < cleanedText.length; i += (chunkSize - overlap)) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: currentChunk.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            })

            if (i + chunkSize >= allWords.length) break
        }
    }

    return chunks
}

/**
 * FIND relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Arrays of chunks
 * @param {String} query - Arrays of chunks
 * @param {number} maxChunks - Maximum chunks to return 
 */

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !query) {
        return []
    }

    //Common stop words to exclude
    const stopWords = new Set([
        'this', 'is', 'at', 'with', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
    ])

    //Extract and clean query words
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))

    if (queryWords.length === 0) {
        //Return clean chunk object without MOngoose metadata
        return chunks.slice(0, maxChunks).map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }))
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase()
        const contentWords = content.split(/\s+/)
        let score = 0

        //Score each query word
        for (const word of queryWords) {
            //Exact word match (higher Score)
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length
            score += exactMatches * 3

            //Partial match (lower Score)
            const partialMatches = (content.match(new RegExp(word, 'g')) || []).length
            score += Math.max(0, partialMatches - exactMatches) * 1.5
        }

        //Bouns : Multiple query words found
        const uniqueWordFound = queryWords.filter(word =>
            content.includes(word)
        ).length
        if (uniqueWordFound > 1) {
            score += uniqueWordFound * 2
        }

        //Normalize by content length
        const normalizedScore = score / Math.sqrt(contentWords)

        //small bouns for earlier chunks
        const positionBonus = 1 - (index / chunks.length) * 0.1

        //Return clean obect without Mongoose metadata
        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordFound
        }
    })

    return scoredChunks
        .filter(chunk => chunk.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score
            }
            if (b.matchedWords !== a.matchedWords) {
                return b.matchedWords - a.matchedWords
            }
            return a.chunkIndex - b.chunkIndex
        })
        .slice(0, maxChunks)
}