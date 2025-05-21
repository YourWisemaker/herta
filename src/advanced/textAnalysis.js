/**
 * Text Analysis module for herta.js
 * Provides natural language processing capabilities including tokenization,
 * sentiment analysis, text classification, and more.
 */

const textAnalysis = {};

/**
 * Tokenize text into words or sentences
 * @param {string} text - Input text
 * @param {string} type - Tokenization type ('word' or 'sentence')
 * @returns {Array} - Array of tokens
 */
textAnalysis.tokenize = function(text, type = 'word') {
  if (type === 'word') {
    // Simple word tokenization with various punctuation handling
    return text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ');
  } else if (type === 'sentence') {
    // Sentence tokenization handling common abbreviations
    return text
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
      .split("|");
  } else {
    throw new Error('Invalid tokenization type. Use "word" or "sentence"');
  }
};

/**
 * Calculate term frequency (TF) for a document
 * @param {string|Array} document - Text document or array of tokens
 * @returns {Object} - Term frequency map
 */
textAnalysis.termFrequency = function(document) {
  const tokens = Array.isArray(document) ? document : this.tokenize(document);
  const tf = {};
  const totalTerms = tokens.length;
  
  for (const token of tokens) {
    const term = token.toLowerCase();
    tf[term] = (tf[term] || 0) + 1;
  }
  
  // Normalize by document length
  for (const term in tf) {
    tf[term] = tf[term] / totalTerms;
  }
  
  return tf;
};

/**
 * Calculate inverse document frequency (IDF) across a corpus
 * @param {Array} corpus - Array of documents (strings or token arrays)
 * @returns {Object} - IDF scores for terms
 */
textAnalysis.inverseDocumentFrequency = function(corpus) {
  const documentCount = corpus.length;
  const termDocumentCount = {};
  const idf = {};
  
  // Count documents containing each term
  for (const document of corpus) {
    const tokens = Array.isArray(document) ? document : this.tokenize(document);
    const uniqueTerms = new Set(tokens.map(token => token.toLowerCase()));
    
    for (const term of uniqueTerms) {
      termDocumentCount[term] = (termDocumentCount[term] || 0) + 1;
    }
  }
  
  // Calculate IDF for each term
  for (const term in termDocumentCount) {
    idf[term] = Math.log(documentCount / termDocumentCount[term]);
  }
  
  return idf;
};

/**
 * Calculate TF-IDF for a document in a corpus
 * @param {string|Array} document - Text document or array of tokens
 * @param {Object} idf - IDF scores for terms
 * @returns {Object} - TF-IDF scores for terms in the document
 */
textAnalysis.tfidf = function(document, idf) {
  const tf = this.termFrequency(document);
  const tfidf = {};
  
  for (const term in tf) {
    tfidf[term] = tf[term] * (idf[term] || 0);
  }
  
  return tfidf;
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Object} vecA - First vector as a map of features to values
 * @param {Object} vecB - Second vector as a map of features to values
 * @returns {number} - Cosine similarity score (0-1)
 */
textAnalysis.cosineSimilarity = function(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  // Calculate dot product and norms
  for (const key in vecA) {
    if (key in vecB) {
      dotProduct += vecA[key] * vecB[key];
    }
    normA += vecA[key] * vecA[key];
  }
  
  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }
  
  // Handle zero vectors
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Basic sentiment analysis based on a lexicon approach
 * @param {string|Array} text - Input text or array of tokens
 * @returns {Object} - Sentiment scores
 */
textAnalysis.analyzeSentiment = function(text) {
  const tokens = Array.isArray(text) ? text : this.tokenize(text);
  
  // Simple lexicon of positive and negative words
  const positiveWords = new Set([
    'good', 'great', 'excellent', 'positive', 'happy', 'wonderful', 'fantastic',
    'amazing', 'love', 'best', 'beautiful', 'perfect', 'awesome', 'impressive'
  ]);
  
  const negativeWords = new Set([
    'bad', 'awful', 'terrible', 'negative', 'sad', 'horrible', 'worst',
    'poor', 'hate', 'disappointing', 'ugly', 'wrong', 'mediocre', 'failed'
  ]);
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const token of tokens) {
    const term = token.toLowerCase();
    if (positiveWords.has(term)) {
      positiveCount++;
    } else if (negativeWords.has(term)) {
      negativeCount++;
    }
  }
  
  const totalWords = tokens.length;
  
  return {
    positive: positiveCount / totalWords,
    negative: negativeCount / totalWords,
    score: (positiveCount - negativeCount) / totalWords,
    magnitude: (positiveCount + negativeCount) / totalWords
  };
};

/**
 * Extract n-grams from text
 * @param {string|Array} text - Input text or array of tokens
 * @param {number} n - Size of n-gram
 * @returns {Array} - Array of n-grams
 */
textAnalysis.extractNgrams = function(text, n = 2) {
  if (n < 1) {
    throw new Error('n must be >= 1');
  }
  
  const tokens = Array.isArray(text) ? text : this.tokenize(text);
  const ngrams = [];
  
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n));
  }
  
  return ngrams;
};

/**
 * Remove stopwords from text
 * @param {string|Array} text - Input text or array of tokens
 * @returns {Array} - Array of tokens with stopwords removed
 */
textAnalysis.removeStopwords = function(text) {
  const tokens = Array.isArray(text) ? text : this.tokenize(text);
  
  // Common English stopwords
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'by', 'for', 'with', 'to', 'from', 'of', 'that',
    'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
  ]);
  
  return tokens.filter(token => !stopwords.has(token.toLowerCase()));
};

/**
 * Apply stemming to reduce words to their root form
 * @param {string|Array} text - Input text or array of tokens
 * @returns {Array} - Array of stemmed tokens
 */
textAnalysis.applyStemming = function(text) {
  const tokens = Array.isArray(text) ? text : this.tokenize(text);
  
  // Simple stemming algorithm (Porter stemming simplified)
  const stem = (word) => {
    // Convert to lowercase
    word = word.toLowerCase();
    
    // Step 1: Handle plurals and -ed or -ing
    word = word.replace(/([^aeiou])ies$/g, '$1y')        // bries -> bry
               .replace(/es$/g, 'e')                     // caresses -> caresse
               .replace(/s$/g, '')                       // cats -> cat
               .replace(/(eed|eedly)$/g, 'ee')           // agreed -> agree
               .replace(/(ed|edly|ing|ingly)$/g, '')     // plastered -> plaster or sing -> sing
    
    // Step 2: Handle common suffixes
    word = word.replace(/(?:ational|tional)$/g, 'ate')   // rational -> rate
               .replace(/(?:enci|anci)$/g, 'ence')       // valenci -> valence
               .replace(/izer$/g, 'ize')                 // digitizer -> digitize
               .replace(/(?:bli|abli)$/g, 'ble')         // possibl -> possible
               .replace(/(?:alli|entli|eli|ousli)$/g, 'al') // drasticalli -> drastical
               .replace(/ization$/g, 'ize')              // rationalization -> rationalize
               .replace(/ation$/g, 'ate')                // operation -> operate
               .replace(/ator$/g, 'ate')                 // operator -> operate
               .replace(/alism$/g, 'al')                 // imperialism -> imperial
               .replace(/iveness$/g, 'ive')              // decisiveness -> decisive
               .replace(/fulness$/g, 'ful')              // hopefulness -> hopeful
               .replace(/ousness$/g, 'ous')              // callousness -> callous
               .replace(/aliti$/g, 'al')                 // formaliti -> formal
               .replace(/iviti$/g, 'ive')                // sensitiviti -> sensitive
               .replace(/biliti$/g, 'ble')               // sensibiliti -> sensible
    
    // Step 3: Handle more suffixes
    word = word.replace(/icate$/g, 'ic')                 // triplicate -> triplic
               .replace(/ative$/g, '')                   // formative -> form
               .replace(/alize$/g, 'al')                 // formalize -> formal
               .replace(/iciti$/g, 'ic')                 // authenticity -> authentic
               .replace(/ical$/g, 'ic')                  // electrical -> electric
               .replace(/ful$/g, '')                     // thoughtful -> thought
               .replace(/ness$/g, '')                    // goodness -> good
    
    return word;
  };
  
  return tokens.map(token => stem(token));
};

/**
 * Extract key phrases from text
 * @param {string} text - Input text
 * @param {number} limit - Maximum number of phrases to return
 * @returns {Array} - Array of key phrases
 */
textAnalysis.extractKeyPhrases = function(text, limit = 5) {
  const sentences = this.tokenize(text, 'sentence');
  const corpus = sentences.map(sentence => this.removeStopwords(sentence));
  
  // Calculate TF-IDF for each term
  const idf = this.inverseDocumentFrequency(corpus);
  const documentScores = corpus.map((doc, index) => {
    const tfidf = this.tfidf(doc, idf);
    
    // Get average TF-IDF score for terms in the document
    const score = Object.values(tfidf).reduce((sum, val) => sum + val, 0) / 
                  Math.max(1, Object.keys(tfidf).length);
    
    return {
      sentence: sentences[index],
      score: score
    };
  });
  
  // Sort documents by score and return top phrases
  documentScores.sort((a, b) => b.score - a.score);
  return documentScores.slice(0, limit).map(doc => doc.sentence);
};

/**
 * Naive Bayes text classifier
 * @returns {Object} - Classifier object
 */
textAnalysis.createNaiveBayesClassifier = function() {
  const categories = {};
  const categoryCounts = {};
  let totalDocuments = 0;
  let vocabulary = new Set();
  
  return {
    // Train the classifier with a document and its category
    train: function(document, category) {
      const tokens = Array.isArray(document) ? 
        document : textAnalysis.tokenize(document);
      
      // Initialize category if needed
      if (!categories[category]) {
        categories[category] = {};
        categoryCounts[category] = 0;
      }
      
      // Update document count for category
      categoryCounts[category]++;
      totalDocuments++;
      
      // Update word counts for this category
      for (const token of tokens) {
        const term = token.toLowerCase();
        vocabulary.add(term);
        
        categories[category][term] = (categories[category][term] || 0) + 1;
      }
    },
    
    // Classify a document
    classify: function(document) {
      const tokens = Array.isArray(document) ? 
        document : textAnalysis.tokenize(document);
      const scores = {};
      const vocabSize = vocabulary.size;
      
      // Calculate score for each category using log probabilities to avoid underflow
      for (const category in categories) {
        const categoryWordCount = Object.values(categories[category])
          .reduce((sum, count) => sum + count, 0);
        
        // Prior probability P(category)
        scores[category] = Math.log(categoryCounts[category] / totalDocuments);
        
        // Calculate P(word|category) for each word and add log probabilities
        for (const token of tokens) {
          const term = token.toLowerCase();
          const termCount = categories[category][term] || 0;
          
          // Use Laplace smoothing
          const probability = (termCount + 1) / (categoryWordCount + vocabSize);
          scores[category] += Math.log(probability);
        }
      }
      
      // Find category with highest score
      let bestCategory = null;
      let bestScore = -Infinity;
      
      for (const category in scores) {
        if (scores[category] > bestScore) {
          bestScore = scores[category];
          bestCategory = category;
        }
      }
      
      return {
        category: bestCategory,
        scores: scores
      };
    },
    
    // Get information about the classifier
    getInfo: function() {
      return {
        categories: Object.keys(categories),
        documentCounts: categoryCounts,
        totalDocuments: totalDocuments,
        vocabularySize: vocabulary.size
      };
    }
  };
};

/**
 * Text summarization using extractive method
 * @param {string} text - Input text
 * @param {number} sentenceCount - Number of sentences in summary
 * @returns {string} - Summarized text
 */
textAnalysis.summarize = function(text, sentenceCount = 3) {
  const sentences = this.tokenize(text, 'sentence');
  
  if (sentences.length <= sentenceCount) {
    return text;
  }
  
  // Calculate sentence scores based on word frequency
  const wordFrequencies = {};
  const sentenceScores = [];
  
  // Count word frequencies
  for (const sentence of sentences) {
    const words = this.tokenize(sentence);
    const filteredWords = this.removeStopwords(words);
    
    for (const word of filteredWords) {
      const term = word.toLowerCase();
      wordFrequencies[term] = (wordFrequencies[term] || 0) + 1;
    }
  }
  
  // Score sentences based on word frequencies
  for (let i = 0; i < sentences.length; i++) {
    const words = this.tokenize(sentences[i]);
    const filteredWords = this.removeStopwords(words);
    let score = 0;
    
    for (const word of filteredWords) {
      const term = word.toLowerCase();
      score += wordFrequencies[term] || 0;
    }
    
    // Normalize by sentence length
    score = filteredWords.length > 0 ? score / filteredWords.length : 0;
    
    sentenceScores.push({
      index: i,
      text: sentences[i],
      score: score
    });
  }
  
  // Sort by score and then by original position
  sentenceScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.index - b.index;
  });
  
  // Select top sentences and sort by original position
  const topSentences = sentenceScores
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index)
    .map(sentence => sentence.text);
  
  return topSentences.join(' ');
};

/**
 * Named Entity Recognition (simple rule-based approach)
 * @param {string} text - Input text
 * @returns {Object} - Map of entity types to found entities
 */
textAnalysis.recognizeEntities = function(text) {
  const words = this.tokenize(text);
  const entities = {
    person: [],
    organization: [],
    location: [],
    date: []
  };
  
  // Simple patterns for entity recognition
  const personTitles = new Set(['mr', 'mrs', 'ms', 'dr', 'prof']);
  const monthNames = new Set([
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]);
  
  // Organization suffixes
  const orgSuffixes = new Set(['inc', 'corp', 'co', 'ltd', 'llc', 'company']);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lowerWord = word.toLowerCase();
    
    // Person detection (basic): title + capitalized name or consecutive capitalized words
    if (i < words.length - 1 && personTitles.has(lowerWord)) {
      if (words[i+1][0] === words[i+1][0].toUpperCase()) {
        entities.person.push(`${word} ${words[i+1]}`);
      }
    } else if (i < words.length - 1 && 
               word[0] === word[0].toUpperCase() && 
               words[i+1][0] === words[i+1][0].toUpperCase()) {
      entities.person.push(`${word} ${words[i+1]}`);
    }
    
    // Organization detection
    if (i < words.length - 1 && 
        word[0] === word[0].toUpperCase() && 
        orgSuffixes.has(words[i+1].toLowerCase())) {
      entities.organization.push(`${word} ${words[i+1]}`);
    }
    
    // Date detection
    if (monthNames.has(lowerWord) && i < words.length - 1) {
      // Check if next word is a number (day)
      if (/^\d+$/.test(words[i+1])) {
        entities.date.push(`${word} ${words[i+1]}`);
      }
    }
  }
  
  return entities;
};

module.exports = textAnalysis;
