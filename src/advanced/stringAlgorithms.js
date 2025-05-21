/**
 * String Algorithms module for herta.js
 * Provides efficient algorithms for string processing and analysis
 */

const stringAlgorithms = {};

/**
 * Compute the Levenshtein (edit) distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - The minimum number of edits required to transform str1 into str2
 */
stringAlgorithms.levenshteinDistance = function (str1, str2) {
  const m = str1.length;
  const n = str2.length;

  // Initialize distance matrix
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  // Base cases: transforming to/from empty string
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
};

/**
 * Compute the longest common subsequence of two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {string} - The longest common subsequence
 */
stringAlgorithms.longestCommonSubsequence = function (str1, str2) {
  const m = str1.length;
  const n = str2.length;

  // Initialize LCS matrix
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstruct the LCS
  let lcs = '';
  let i = m; let
    j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcs = str1[i - 1] + lcs;
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
};

/**
 * Knuth-Morris-Pratt (KMP) pattern matching algorithm
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {Array} - Array of starting indices where the pattern is found
 */
stringAlgorithms.kmpSearch = function (text, pattern) {
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return [];
  if (m > n) return [];

  // Compute LPS (Longest Prefix Suffix) array
  const lps = Array(m).fill(0);
  let len = 0;
  let i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }

  // Search for pattern using LPS
  const matches = [];
  let j = 0; // index for pattern
  i = 0; // index for text

  while (i < n) {
    if (pattern[j] === text[i]) {
      i++;
      j++;
    }

    if (j === m) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < n && pattern[j] !== text[i]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  return matches;
};

/**
 * Boyer-Moore string search algorithm
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {Array} - Array of starting indices where the pattern is found
 */
stringAlgorithms.boyerMooreSearch = function (text, pattern) {
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return [];
  if (m > n) return [];

  // Bad character heuristic
  const badChar = new Map();
  for (let i = 0; i < m; i++) {
    badChar.set(pattern[i], i);
  }

  const matches = [];
  let s = 0; // Shift of the pattern with respect to text

  while (s <= (n - m)) {
    let j = m - 1;

    // Compare pattern with text from right to left
    while (j >= 0 && pattern[j] === text[s + j]) {
      j--;
    }

    if (j < 0) {
      // Pattern found
      matches.push(s);
      // Shift to align with the next possible match
      s += (s + m < n) ? m - badChar.get(text[s + m]) || m : 1;
    } else {
      // Shift based on bad character rule
      const badCharShift = badChar.get(text[s + j]);
      s += Math.max(1, j - (badCharShift || -1));
    }
  }

  return matches;
};

/**
 * Compute the Rabin-Karp rolling hash for efficient string matching
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {Array} - Array of starting indices where the pattern is found
 */
stringAlgorithms.rabinKarpSearch = function (text, pattern) {
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return [];
  if (m > n) return [];

  const prime = 101;
  const base = 256;

  // Calculate hash value for pattern and first window of text
  let patternHash = 0;
  let textHash = 0;
  let h = 1;

  // Calculate h = base^(m-1) % prime
  for (let i = 0; i < m - 1; i++) {
    h = (h * base) % prime;
  }

  // Calculate initial hash values
  for (let i = 0; i < m; i++) {
    patternHash = (base * patternHash + pattern.charCodeAt(i)) % prime;
    textHash = (base * textHash + text.charCodeAt(i)) % prime;
  }

  const matches = [];

  // Slide the pattern over text one by one
  for (let i = 0; i <= n - m; i++) {
    // Check the hash values
    if (patternHash === textHash) {
      // Verify character by character
      let j = 0;
      for (j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) break;
      }

      if (j === m) {
        matches.push(i);
      }
    }

    // Compute hash for next window
    if (i < n - m) {
      textHash = (base * (textHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % prime;
      if (textHash < 0) textHash += prime;
    }
  }

  return matches;
};

/**
 * Z-algorithm for pattern matching
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {Array} - Array of starting indices where the pattern is found
 */
stringAlgorithms.zAlgorithm = function (text, pattern) {
  const concat = `${pattern}$${text}`;
  const n = concat.length;

  // Z-array stores length of substring starting at i that matches the prefix
  const z = Array(n).fill(0);

  let l = 0; let
    r = 0;
  for (let i = 1; i < n; i++) {
    if (i <= r) {
      z[i] = Math.min(r - i + 1, z[i - l]);
    }

    while (i + z[i] < n && concat[z[i]] === concat[i + z[i]]) {
      z[i]++;
    }

    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1;
    }
  }

  // Find matches
  const matches = [];
  const patternLength = pattern.length;

  for (let i = 0; i < n; i++) {
    if (z[i] === patternLength) {
      matches.push(i - patternLength - 1);
    }
  }

  return matches;
};

/**
 * Aho-Corasick algorithm for multi-pattern string matching
 * @param {Array} patterns - Array of patterns to search for
 * @param {string} text - The text to search in
 * @returns {Object} - Maps each pattern to an array of its occurrences
 */
stringAlgorithms.ahoCorasickSearch = function (patterns, text) {
  // Build trie and failure function
  const root = {
    goto: new Map(), output: [], failure: null, depth: 0
  };

  // Build trie
  for (let i = 0; i < patterns.length; i++) {
    let currentState = root;
    const pattern = patterns[i];

    for (let j = 0; j < pattern.length; j++) {
      const ch = pattern[j];
      if (!currentState.goto.has(ch)) {
        currentState.goto.set(ch, {
          goto: new Map(),
          output: [],
          failure: null,
          depth: currentState.depth + 1
        });
      }
      currentState = currentState.goto.get(ch);
    }

    currentState.output.push(i);
  }

  // Build failure function with BFS
  const queue = [];
  for (const [ch, state] of root.goto) {
    state.failure = root;
    queue.push(state);
  }

  while (queue.length > 0) {
    const currentState = queue.shift();

    for (const [ch, nextState] of currentState.goto) {
      queue.push(nextState);

      let failureState = currentState.failure;

      while (failureState !== null && !failureState.goto.has(ch)) {
        failureState = failureState.failure;
      }

      if (failureState === null) {
        nextState.failure = root;
      } else {
        nextState.failure = failureState.goto.get(ch);
        // Merge output sets
        nextState.output = [...nextState.output, ...nextState.failure.output];
      }
    }
  }

  // Search text
  const results = patterns.map(() => []);
  let currentState = root;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    // Find next state
    while (currentState !== root && !currentState.goto.has(ch)) {
      currentState = currentState.failure;
    }

    if (currentState.goto.has(ch)) {
      currentState = currentState.goto.get(ch);
    }

    // Process outputs at this state
    for (const patternIndex of currentState.output) {
      const patternLength = patterns[patternIndex].length;
      results[patternIndex].push(i - patternLength + 1);
    }
  }

  return results;
};

/**
 * Suffix array construction using prefix doubling
 * @param {string} s - Input string
 * @returns {Array} - Suffix array
 */
stringAlgorithms.buildSuffixArray = function (s) {
  const n = s.length;

  // Initialize suffix array and rank arrays
  const sa = Array(n);
  const rank = Array(n);
  const tempRank = Array(n);

  // Initialize with single character ranks
  for (let i = 0; i < n; i++) {
    sa[i] = i;
    rank[i] = s.charCodeAt(i);
  }

  // Sort suffixes by first character
  sa.sort((a, b) => rank[a] - rank[b]);

  // Prefix doubling
  for (let k = 1; k < n; k *= 2) {
    // Update ranks
    let r = 0;
    tempRank[sa[0]] = 0;

    for (let i = 1; i < n; i++) {
      if (rank[sa[i]] !== rank[sa[i - 1]]
          || (sa[i] + k < n ? rank[sa[i] + k] : -1)
          !== (sa[i - 1] + k < n ? rank[sa[i - 1] + k] : -1)) {
        r++;
      }
      tempRank[sa[i]] = r;
    }

    for (let i = 0; i < n; i++) {
      rank[i] = tempRank[i];
    }

    // If all suffixes have distinct ranks, break
    if (r === n - 1) break;

    // Sort by pair (rank[i], rank[i+k])
    const sortPairs = (a, b) => {
      if (rank[a] !== rank[b]) return rank[a] - rank[b];
      const aNext = a + k < n ? rank[a + k] : -1;
      const bNext = b + k < n ? rank[b + k] : -1;
      return aNext - bNext;
    };

    sa.sort(sortPairs);
  }

  return sa;
};

/**
 * Compute the longest common prefix array from a suffix array
 * @param {string} s - Input string
 * @param {Array} sa - Suffix array
 * @returns {Array} - LCP array
 */
stringAlgorithms.buildLCPArray = function (s, sa) {
  const n = s.length;
  const lcp = Array(n).fill(0);

  // Compute reverse of suffix array
  const rank = Array(n);
  for (let i = 0; i < n; i++) {
    rank[sa[i]] = i;
  }

  // Compute LCP values
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1];
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) {
        h++;
      }
      lcp[rank[i]] = h;
      if (h > 0) h--;
    }
  }

  return lcp;
};

/**
 * Find the longest repeated substring in a string
 * @param {string} s - Input string
 * @returns {string} - Longest repeated substring
 */
stringAlgorithms.longestRepeatedSubstring = function (s) {
  const sa = this.buildSuffixArray(s);
  const lcp = this.buildLCPArray(s, sa);

  // Find maximum LCP value and its position
  let maxLcp = 0;
  let maxLcpIdx = 0;

  for (let i = 1; i < s.length; i++) {
    if (lcp[i] > maxLcp) {
      maxLcp = lcp[i];
      maxLcpIdx = i;
    }
  }

  if (maxLcp === 0) return '';

  return s.substring(sa[maxLcpIdx], sa[maxLcpIdx] + maxLcp);
};

/**
 * Compress a string using run-length encoding
 * @param {string} s - Input string
 * @returns {string} - Compressed string
 */
stringAlgorithms.runLengthEncode = function (s) {
  if (!s || s.length === 0) return '';

  let result = '';
  let count = 1;
  let prev = s[0];

  for (let i = 1; i < s.length; i++) {
    if (s[i] === prev) {
      count++;
    } else {
      result += prev + (count > 1 ? count : '');
      count = 1;
      prev = s[i];
    }
  }

  result += prev + (count > 1 ? count : '');
  return result;
};

/**
 * Decompress a run-length encoded string
 * @param {string} s - Run-length encoded string
 * @returns {string} - Original string
 */
stringAlgorithms.runLengthDecode = function (s) {
  if (!s || s.length === 0) return '';

  let result = '';
  let i = 0;

  while (i < s.length) {
    const char = s[i++];
    let countStr = '';

    while (i < s.length && /\d/.test(s[i])) {
      countStr += s[i++];
    }

    const count = countStr ? parseInt(countStr, 10) : 1;
    result += char.repeat(count);
  }

  return result;
};

module.exports = stringAlgorithms;
