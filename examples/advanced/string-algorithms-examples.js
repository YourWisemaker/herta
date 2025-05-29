/**
 * String Algorithms Module Examples
 * Demonstrates advanced string processing algorithms in Herta.js
 */

const herta = require('../../src/index.js');

const { stringAlgorithms } = herta;

console.log('Herta.js String Algorithms Examples');
console.log('==================================\n');

// 1. String Distance Metrics
console.log('1. String Distance and Similarity Metrics');
console.log('---------------------------------------');

const string1 = 'kitten';
const string2 = 'sitting';

// Levenshtein (edit) distance
const editDistance = stringAlgorithms.levenshteinDistance(string1, string2);
console.log(`Levenshtein distance between "${string1}" and "${string2}": ${editDistance}`);

// Longest Common Subsequence
const lcs = stringAlgorithms.longestCommonSubsequence(string1, string2);
console.log(`Longest Common Subsequence: "${lcs}"`);
console.log(`LCS Length: ${lcs.length}`);

// String similarity based on edit distance
const similarity = stringAlgorithms.stringSimilarity(string1, string2);
console.log(`Similarity (0-1 scale): ${similarity.toFixed(4)}`);
console.log();

// 2. Pattern Matching Algorithms
console.log('2. Pattern Matching Algorithms');
console.log('----------------------------');

const text = 'The quick brown fox jumps over the lazy dog. The fox is quick and brown.';
const pattern = 'fox';

// Naive search
console.log(`Text: "${text}"`);
console.log(`Pattern: "${pattern}"`);

console.log('\nNaive Pattern Search:');
const naiveMatches = stringAlgorithms.naivePatternSearch(text, pattern);
console.log(`Found at positions: ${naiveMatches.join(', ')}`);

// KMP algorithm
console.log('\nKnuth-Morris-Pratt Algorithm:');
const kmpMatches = stringAlgorithms.kmpSearch(text, pattern);
console.log(`Found at positions: ${kmpMatches.join(', ')}`);

// Boyer-Moore algorithm
console.log('\nBoyer-Moore Algorithm:');
const bmMatches = stringAlgorithms.boyerMooreSearch(text, pattern);
console.log(`Found at positions: ${bmMatches.join(', ')}`);

// Rabin-Karp algorithm
console.log('\nRabin-Karp Algorithm:');
const rkMatches = stringAlgorithms.rabinKarpSearch(text, pattern);
console.log(`Found at positions: ${rkMatches.join(', ')}`);

// Z-Algorithm
console.log('\nZ-Algorithm:');
const zMatches = stringAlgorithms.zAlgorithmSearch(text, pattern);
console.log(`Found at positions: ${zMatches.join(', ')}`);
console.log();

// 3. Multi-pattern matching with Aho-Corasick
console.log('3. Multi-Pattern Matching with Aho-Corasick');
console.log('----------------------------------------');

const textForMultiMatch = 'The JavaScript language is widely used in web development.';
const patterns = ['JavaScript', 'web', 'language', 'code', 'development'];

console.log(`Text: "${textForMultiMatch}"`);
console.log(`Patterns: ${JSON.stringify(patterns)}`);

const ahoCorasickMatches = stringAlgorithms.ahoCorasickSearch(textForMultiMatch, patterns);
console.log('\nAho-Corasick Results:');
for (const pattern in ahoCorasickMatches) {
  console.log(`  "${pattern}": found at positions ${ahoCorasickMatches[pattern].join(', ')}`);
}
console.log();

// 4. Suffix Arrays and LCP
console.log('4. Suffix Arrays and LCP');
console.log('-----------------------');

const textForSuffix = 'banana';
console.log(`Text: "${textForSuffix}"`);

// Build suffix array
const suffixArray = stringAlgorithms.buildSuffixArray(textForSuffix);
console.log('\nSuffix Array:');
console.log(suffixArray);

// Suffixes in sorted order
console.log('\nSorted Suffixes:');
suffixArray.forEach((idx) => {
  console.log(`  ${idx}: ${textForSuffix.substring(idx)}`);
});

// Build LCP array
const lcpArray = stringAlgorithms.buildLCPArray(textForSuffix, suffixArray);
console.log('\nLCP Array:');
console.log(lcpArray);

// Find longest repeated substring
const longestRepeated = stringAlgorithms.longestRepeatedSubstring(textForSuffix);
console.log(`\nLongest repeated substring: "${longestRepeated}"`);
console.log();

// 5. String Compression
console.log('5. String Compression');
console.log('-------------------');

const textToCompress = 'aaabbbcccaaabbbaaabbbcccaaa';
console.log(`Original text: "${textToCompress}" (length: ${textToCompress.length})`);

// Run-length encoding
const compressed = stringAlgorithms.runLengthEncode(textToCompress);
console.log(`RLE compressed: "${compressed}" (length: ${compressed.length})`);

// Run-length decoding
const decompressed = stringAlgorithms.runLengthDecode(compressed);
console.log(`RLE decompressed: "${decompressed}" (length: ${decompressed.length})`);
console.log(`Successful decompression: ${decompressed === textToCompress ? 'Yes' : 'No'}`);

// Demonstrate a more advanced compression technique
console.log('\nAdvanced Compression:');
const longText = 'This is a test string with some repeated patterns. '
                 + 'This is a test string with some repeated patterns. '
                 + 'The quick brown fox jumps over the lazy dog. '
                 + 'The quick brown fox jumps over the lazy dog.';

console.log(`Original text length: ${longText.length} characters`);

const advancedCompressed = stringAlgorithms.compressString(longText);
console.log(`Compressed data size: ${advancedCompressed.length} bytes`);

const advancedDecompressed = stringAlgorithms.decompressString(advancedCompressed);
console.log(`Successful advanced decompression: ${advancedDecompressed === longText ? 'Yes' : 'No'}`);

console.log('\nHerta.js String Algorithms module demonstration completed!');
