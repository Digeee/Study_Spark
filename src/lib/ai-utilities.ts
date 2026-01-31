// AI Utilities using local logic (Rule-based Fallback)
// Copied from user provided logic

const MIN_WORDS = 20;
const MIN_SENTENCES = 2;

// Fallback AI responses (rule-based) when API is not available

// Helper function to extract top words (Moved to top for usage)
const extractTopWords = (text: string, count = 10) => {
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
        'that', 'this', 'these', 'those', 'it', 'he', 'she', 'they', 'we',
        'you', 'i', 'me', 'him', 'her', 'them', 'us', 'my', 'your', 'his',
        'its', 'our', 'their', 'what', 'which', 'who', 'whom', 'whose',
        'not', 'no', 'yes', 'so', 'if', 'then', 'else', 'when', 'where',
        'how', 'why', 'about', 'into', 'over', 'under', 'above', 'below',
        'up', 'down', 'out', 'off', 'through', 'while', 'during', 'before',
        'after', 'between', 'among', 'just', 'only', 'very', 'too', 'also',
        'more', 'most', 'some', 'any', 'all', 'none', 'one', 'two', 'three'
    ]);

    // Clean text and split into words
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !commonWords.has(w));

    // Count frequencies
    const freqMap: Record<string, number> = {};
    words.forEach(w => {
        freqMap[w] = (freqMap[w] || 0) + 1;
    });

    // Sort and take top count
    return Object.entries(freqMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, count)
        .map(([word, count]) => ({ word, count }));
};

export const generateSummary = (text: string) => {
    if (!text || text.trim().length === 0) {
        return '⚠️ No content to summarize. Please add at least 2-3 sentences of study material.';
    }

    const words = text.trim().split(/\s+/);
    if (words.length < MIN_WORDS) {
        return `⚠️ Content too short (${words.length} words). Please add at least ${MIN_WORDS} words for AI analysis to work properly. Try adding a few sentences about your topic.`;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (sentences.length < MIN_SENTENCES) {
        return `⚠️ Please add at least ${MIN_SENTENCES} complete sentences for better analysis.`;
    }

    // Take first 3 sentences or up to 200 chars
    const summary = sentences.slice(0, 3).join('. ').trim();
    return summary.length > 0 ? summary + '.' : text.substring(0, 200) + '...';
};

export const generateFAQs = (text: string, title: string) => {
    if (!text || text.trim().length === 0) {
        return [
            { q: 'How do I use this feature?', a: 'Add at least 2-3 sentences of study content, then click on the notebook to see AI-generated FAQs, summaries, and more!' }
        ];
    }

    const words = text.trim().split(/\s+/);
    if (words.length < MIN_WORDS) {
        return [
            {
                q: 'Why is the analysis not working?',
                a: `Your content is too short (${words.length} words). Please add at least ${MIN_WORDS} words of study material. For example: "Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts using chlorophyll. This process produces oxygen and glucose."`
            }
        ];
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keywords = extractTopWords(text, 3);

    const faqs = [];

    // FAQ 1: Main topic
    if (sentences.length > 0) {
        faqs.push({
            q: `What is the main topic of "${title}"?`,
            a: sentences[0].trim() + '.'
        });
    }

    // FAQ 2: Key concepts
    if (keywords.length > 0) {
        faqs.push({
            q: 'What are the key concepts covered?',
            a: `The main concepts include: ${keywords.map(k => k.word).join(', ')}.`
        });
    }

    // FAQ 3: Reading time
    const readingTime = Math.ceil(words.length / 200);
    faqs.push({
        q: 'How long does it take to read?',
        a: `Approximately ${readingTime} minute${readingTime > 1 ? 's' : ''} (${words.length} words).`
    });

    // FAQ 4: Summary
    if (sentences.length > 1) {
        faqs.push({
            q: 'Can you give me a quick summary?',
            a: sentences.slice(0, 2).join('. ').trim() + '.'
        });
    }

    return faqs;
};

export const generateFlashcards = (text: string) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const words = text.trim().split(/\s+/);
    if (words.length < MIN_WORDS) {
        return [
            {
                front: '📝 How to use Flashcards?',
                back: `Add at least ${MIN_WORDS} words of study content to generate flashcards automatically. The AI will extract key concepts and create study cards for you!`
            }
        ];
    }

    const keywords = extractTopWords(text, 6);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (keywords.length === 0) {
        return [
            {
                front: '💡 Tip',
                back: 'Add more detailed content with key concepts to generate better flashcards!'
            }
        ];
    }

    return keywords.map((kw, index) => {
        // Find sentence containing this keyword
        const relevantSentence = sentences.find(s =>
            s.toLowerCase().includes(kw.word.toLowerCase())
        );

        return {
            front: `What is "${kw.word}"?`,
            back: relevantSentence
                ? relevantSentence.trim() + '.'
                : `A key concept mentioned ${kw.count} time${kw.count > 1 ? 's' : ''} in the document.`
        };
    });
};

export const generateQuiz = (text: string, title: string) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const words = text.trim().split(/\s+/);
    if (words.length < MIN_WORDS) {
        return [
            {
                question: '📚 How to generate quizzes?',
                options: [
                    'Add at least 20 words of content',
                    'Click the analyze button',
                    'Wait for AI processing',
                    'All of the above'
                ],
                correct: 'All of the above',
                explanation: 'Add detailed study content (at least 20 words) and the AI will automatically generate practice quizzes for you!'
            }
        ];
    }

    const keywords = extractTopWords(text, 5);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (keywords.length < 2 || sentences.length < 2) {
        return [
            {
                question: 'What should I do to get better quizzes?',
                options: [
                    'Add more detailed content',
                    'Include key concepts',
                    'Write complete sentences',
                    'All of the above'
                ],
                correct: 'All of the above',
                explanation: 'More detailed content helps the AI generate better practice questions!'
            }
        ];
    }

    const quizzes = [];

    // Quiz 1: Main topic
    if (keywords.length >= 4) {
        quizzes.push({
            question: `Which concept is most central to "${title}"?`,
            options: keywords.slice(0, 4).map(k => k.word),
            correct: keywords[0].word,
            explanation: `"${keywords[0].word}" appears ${keywords[0].count} times, making it the most important concept.`
        });
    }

    // Quiz 2: True/False
    if (sentences.length > 0) {
        quizzes.push({
            question: `True or False: ${sentences[0].trim()}`,
            options: ['True', 'False'],
            correct: 'True',
            explanation: 'This statement is directly from the source material.'
        });
    }

    // Quiz 3: Fill in the blank
    if (sentences.length > 1 && keywords.length > 0) {
        const sentence = sentences[1];
        const keyword = keywords[0].word;
        const blanked = sentence.replace(new RegExp(keyword, 'gi'), '____');

        quizzes.push({
            question: `Fill in the blank: ${blanked}`,
            options: [keyword, ...keywords.slice(1, 4).map(k => k.word)],
            correct: keyword,
            explanation: `The correct answer is "${keyword}".`
        });
    }

    return quizzes;
};

export const generateTimeline = (text: string) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    return sentences.slice(0, 6).map((sentence, index) => ({
        step: index + 1,
        title: `Point ${index + 1}`,
        content: sentence.trim() + '.'
    }));
};

export const generateMindMap = (text: string) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const keywords = extractTopWords(text, 8);

    return keywords.map((kw, index) => ({
        concept: kw.word,
        frequency: kw.count,
        connections: keywords
            .filter((k, i) => i !== index)
            .slice(0, 3)
            .map(k => k.word)
    }));
};

export const generatePodcastScript = (text: string, title: string) => {
    if (!text || text.trim().length === 0) {
        return {
            title: `Audio Overview: ${title}`,
            duration: '0 min',
            description: 'No content available for podcast generation.'
        };
    }

    const words = text.split(/\s+/);
    const duration = Math.ceil(words.length / 150); // 150 words per minute

    return {
        title: `Audio Overview: ${title}`,
        duration: `${duration} min`,
        description: `An AI-generated audio discussion covering the key points of "${title}". This ${duration}-minute overview will help you understand the main concepts quickly.`,
        script: generateSummary(text)
    };
};
