/**
 * Cryptoeconomics module for herta.js
 * Provides mathematical foundations for blockchain and web3 applications
 * including cryptographic primitives, zero-knowledge proofs, and economic models
 */

const arithmetic = require('../core/arithmetic');
const numberTheory = require('./numberTheory');

const cryptoeconomics = {};

/**
 * Construct a Merkle tree from a list of data items
 * @param {Array} data - List of data items
 * @param {Function} hashFunction - Hash function to use (default: SHA-256)
 * @returns {Object} - Merkle tree structure
 */
cryptoeconomics.createMerkleTree = function (data, hashFunction) {
  if (!hashFunction) {
    // Default hash function (simple for demonstration)
    hashFunction = (data) => {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash &= hash; // Convert to 32bit integer
      }
      return hash.toString(16);
    };
  }

  // Create leaf nodes
  const leaves = data.map((item) => ({
    data: item,
    hash: hashFunction(item),
    parent: null,
    children: []
  }));

  // Build tree upward
  let nodes = leaves;
  const tree = {
    root: null,
    leaves,
    levels: [leaves],
    getProof: (leaf) => cryptoeconomics.getMerkleProof(tree, leaf)
  };

  while (nodes.length > 1) {
    const parentLevel = [];

    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = i + 1 < nodes.length ? nodes[i + 1] : left; // Duplicate last node if odd

      const combinedHash = hashFunction(left.hash + right.hash);
      const parent = {
        hash: combinedHash,
        children: [left, right],
        parent: null
      };

      left.parent = parent;
      right.parent = parent;

      parentLevel.push(parent);
    }

    tree.levels.push(parentLevel);
    nodes = parentLevel;
  }

  tree.root = nodes[0];
  return tree;
};

/**
 * Get Merkle proof for a data element
 * @param {Object} tree - Merkle tree
 * @param {Object} leaf - Leaf node to generate proof for
 * @returns {Array} - Merkle proof (array of hashes and positions)
 */
cryptoeconomics.getMerkleProof = function (tree, leaf) {
  const proof = [];
  let current = leaf;

  while (current !== tree.root && current.parent) {
    const { parent } = current;
    const isLeft = parent.children[0] === current;
    const sibling = isLeft ? parent.children[1] : parent.children[0];

    proof.push({
      hash: sibling.hash,
      position: isLeft ? 'right' : 'left'
    });

    current = parent;
  }

  return proof;
};

/**
 * Verify a Merkle proof
 * @param {string} rootHash - Merkle root hash
 * @param {string} leafHash - Leaf node hash
 * @param {Array} proof - Merkle proof
 * @param {Function} hashFunction - Hash function used
 * @returns {boolean} - True if the proof is valid
 */
cryptoeconomics.verifyMerkleProof = function (rootHash, leafHash, proof, hashFunction) {
  if (!hashFunction) {
    // Default hash function (simple for demonstration)
    hashFunction = (data) => {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash &= hash; // Convert to 32bit integer
      }
      return hash.toString(16);
    };
  }

  let currentHash = leafHash;

  for (const step of proof) {
    if (step.position === 'right') {
      currentHash = hashFunction(currentHash + step.hash);
    } else {
      currentHash = hashFunction(step.hash + currentHash);
    }
  }

  return currentHash === rootHash;
};

/**
 * Implement a simplified Pedersen commitment scheme
 * @param {number} value - Value to commit to
 * @param {number} blinding - Blinding factor
 * @param {Object} params - Elliptic curve parameters
 * @returns {Object} - The commitment
 */
cryptoeconomics.pedersenCommitment = function (value, blinding, params = {}) {
  const p = params.p || 2147483647; // Prime modulus (Mersenne prime 2^31 - 1)
  const g = params.g || 3; // Generator point g
  const h = params.h || 5; // Generator point h

  // Calculate C = g^value * h^blinding mod p
  const gPowV = numberTheory.modPow(g, value, p);
  const hPowR = numberTheory.modPow(h, blinding, p);
  const commitment = (gPowV * hPowR) % p;

  return {
    commitment,
    value,
    blinding,
    verify: (v, r) => {
      const gPowV = numberTheory.modPow(g, v, p);
      const hPowR = numberTheory.modPow(h, r, p);
      return ((gPowV * hPowR) % p) === commitment;
    }
  };
};

/**
 * Calculate tokenomics and token distribution metrics
 * @param {Object} params - Initial parameters
 * @returns {Object} - Tokenomics model
 */
cryptoeconomics.createTokenomicsModel = function (params) {
  const {
    initialSupply = 100000000,
    inflationRate = 0.02, // 2% annual inflation
    stakingRewardRate = 0.05, // 5% staking reward
    burnRate = 0.001, // 0.1% burn rate
    vestingSchedules = [],
    distributionRatios = {
      team: 0.15, investors: 0.15, community: 0.6, reserves: 0.1
    }
  } = params;

  // Calculate initial distribution
  const distribution = {};
  for (const [key, ratio] of Object.entries(distributionRatios)) {
    distribution[key] = initialSupply * ratio;
  }

  return {
    initialSupply,
    distribution,
    inflationRate,
    stakingRewardRate,
    burnRate,
    vestingSchedules,

    // Calculate projected supply after n periods (e.g., years)
    projectSupply(periods) {
      let currentSupply = initialSupply;
      const supplyHistory = [currentSupply];

      for (let i = 0; i < periods; i++) {
        // Inflation increases supply
        const inflation = currentSupply * inflationRate;
        // Burning decreases supply
        const burned = currentSupply * burnRate;

        currentSupply = currentSupply + inflation - burned;
        supplyHistory.push(currentSupply);
      }

      return {
        finalSupply: currentSupply,
        supplyHistory
      };
    },

    // Calculate staking rewards distribution
    calculateStakingRewards(stakedAmount, periods) {
      const rewards = [];
      let cumulativeReward = 0;
      let currentStaked = stakedAmount;

      for (let i = 0; i < periods; i++) {
        const periodReward = currentStaked * stakingRewardRate;
        cumulativeReward += periodReward;

        // If rewards are automatically restaked
        currentStaked += periodReward;

        rewards.push({
          period: i + 1,
          reward: periodReward,
          cumulativeReward,
          stakedAmount: currentStaked
        });
      }

      return rewards;
    },

    // Calculate vesting schedule
    calculateVesting(periods) {
      const vestedByPeriod = Array(periods).fill(0);

      for (const schedule of vestingSchedules) {
        const {
          amount,
          cliffPeriods = 0,
          vestingPeriods,
          startPeriod = 0,
          category
        } = schedule;

        if (!amount || !vestingPeriods) continue;

        // No tokens are released before the cliff
        for (let i = startPeriod + cliffPeriods; i < startPeriod + vestingPeriods && i < periods; i++) {
          const periodicAmount = amount / vestingPeriods;
          vestedByPeriod[i] += periodicAmount;
        }
      }

      return vestedByPeriod;
    }
  };
};

/**
 * Implement a simplified Schnorr signature scheme
 * @param {Buffer|string} message - Message to sign
 * @param {Object} keyPair - Key pair {privateKey, publicKey}
 * @param {Object} params - Curve parameters
 * @returns {Object} - Signature and verification function
 */
cryptoeconomics.schnorrSign = function (message, keyPair, params = {}) {
  const p = params.p || 2147483647; // Prime modulus
  const g = params.g || 3; // Generator

  // Convert message to a number if it's a string
  const msgNum = typeof message === 'string'
    ? message.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0) % p
    : message % p;

  const { privateKey } = keyPair;

  // Generate a random nonce k
  // In practice, this should be cryptographically secure random
  const k = Math.floor(Math.random() * (p - 1)) + 1;

  // Calculate commitment R = g^k mod p
  const r = numberTheory.modPow(g, k, p);

  // Calculate challenge e = H(R || pubKey || msg)
  const e = (r + keyPair.publicKey + msgNum) % p;

  // Calculate response s = k - e * privateKey mod (p-1)
  let s = (k - e * privateKey) % (p - 1);
  if (s < 0) s += (p - 1); // Ensure positive mod

  return {
    signature: { r, s },
    verify(message, publicKey) {
      // Convert message to a number if it's a string
      const msgNum = typeof message === 'string'
        ? message.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0) % p
        : message % p;

      // Calculate challenge e = H(R || pubKey || msg)
      const e = (r + publicKey + msgNum) % p;

      // Verify g^s * pubKey^e = R
      const gs = numberTheory.modPow(g, s, p);
      const pubKeyE = numberTheory.modPow(publicKey, e, p);
      const expected = (gs * pubKeyE) % p;

      return expected === r;
    }
  };
};

/**
 * Implemention of Verifiable Secret Sharing (Shamir's scheme)
 * @param {number} secret - Secret to share
 * @param {number} threshold - Minimum shares needed to reconstruct
 * @param {number} numShares - Total number of shares to create
 * @param {number} prime - Prime modulus
 * @returns {Object} - Shares and verification
 */
cryptoeconomics.createSecretShares = function (secret, threshold, numShares, prime) {
  if (threshold > numShares) {
    throw new Error('Threshold cannot exceed the number of shares');
  }

  // If prime is not specified, choose a large prime
  if (!prime) {
    prime = 2147483647; // Mersenne prime 2^31 - 1
  }

  // Generate random coefficients for the polynomial
  const coefficients = [secret]; // a0 = secret
  for (let i = 1; i < threshold; i++) {
    // In practice, these should be cryptographically secure random numbers
    coefficients.push(Math.floor(Math.random() * (prime - 1)));
  }

  // Evaluate the polynomial for each share
  const shares = [];
  for (let x = 1; x <= numShares; x++) {
    let y = coefficients[0]; // Start with the secret

    // Evaluate polynomial
    for (let i = 1; i < coefficients.length; i++) {
      // y += coefficients[i] * x^i
      const term = (coefficients[i] * numberTheory.modPow(x, i, prime)) % prime;
      y = (y + term) % prime;
    }

    shares.push({ x, y });
  }

  return {
    shares,

    // Reconstruct the secret from t or more shares
    reconstructSecret(shares) {
      if (shares.length < threshold) {
        throw new Error(`Need at least ${threshold} shares to reconstruct the secret`);
      }

      let secret = 0;

      // Lagrange interpolation
      for (let i = 0; i < threshold; i++) {
        const { x: xi, y: yi } = shares[i];
        let lagrangeCoefficient = 1;

        for (let j = 0; j < threshold; j++) {
          if (i !== j) {
            const { x: xj } = shares[j];
            // Calculate (xj / (xj - xi)) mod prime

            // First, calculate (xj - xi)^-1 mod prime
            let denominator = (xj - xi) % prime;
            if (denominator < 0) denominator += prime;

            const denominatorInverse = numberTheory.modInverse(denominator, prime);

            // Multiply by xj
            const term = (xj * denominatorInverse) % prime;

            lagrangeCoefficient = (lagrangeCoefficient * term) % prime;
          }
        }

        // Add this share's contribution: yi * lagrangeCoefficient
        const contribution = (yi * lagrangeCoefficient) % prime;
        secret = (secret + contribution) % prime;
      }

      return secret;
    }
  };
};

/**
 * Bonding curve pricing model for token economics
 * @param {Object} params - Curve parameters
 * @returns {Object} - Bonding curve model
 */
cryptoeconomics.createBondingCurve = function (params = {}) {
  const {
    curveType = 'linear', // 'linear', 'quadratic', 'exponential', 'logarithmic'
    slope = 1,
    initialPrice = 0,
    reserveRatio = 0.5, // For bancor-style curves
    initialSupply = 0,
    initialReserve = 0
  } = params;

  let currentSupply = initialSupply;
  let currentReserve = initialReserve;

  const calculatePrice = (supply) => {
    switch (curveType) {
      case 'linear':
        return initialPrice + slope * supply;
      case 'quadratic':
        return initialPrice + slope * supply * supply;
      case 'exponential':
        return initialPrice + Math.exp(slope * supply) - 1;
      case 'logarithmic':
        return initialPrice + slope * Math.log(supply + 1);
      case 'bancor':
        if (supply === 0) return initialPrice;
        // Bancor formula: price = reserve / (supply * reserveRatio)
        return currentReserve / (supply * reserveRatio);
      default:
        return initialPrice + slope * supply;
    }
  };

  const calculateMintCost = (supplyDelta) => {
    if (curveType === 'bancor') {
      // For bancor-style curves, we need a different formula
      const newSupply = currentSupply + supplyDelta;
      return currentReserve * (((newSupply / currentSupply) ** (1 / reserveRatio)) - 1);
    }

    const currentPrice = calculatePrice(currentSupply);
    const newPrice = calculatePrice(currentSupply + supplyDelta);

    // Integral of the price curve from currentSupply to (currentSupply + supplyDelta)
    switch (curveType) {
      case 'linear':
        // ∫(initialPrice + slope*x)dx = initialPrice*x + slope*x^2/2
        const initialTerm = initialPrice * supplyDelta;
        const slopeTerm = slope * (
          (currentSupply + supplyDelta) ** 2 - currentSupply ** 2
        ) / 2;
        return initialTerm + slopeTerm;

      case 'quadratic':
        // ∫(initialPrice + slope*x^2)dx = initialPrice*x + slope*x^3/3
        const initialTermQuad = initialPrice * supplyDelta;
        const slopeTermQuad = slope * (
          (currentSupply + supplyDelta) ** 3 - currentSupply ** 3
        ) / 3;
        return initialTermQuad + slopeTermQuad;

      case 'exponential':
        // ∫(initialPrice + e^(slope*x) - 1)dx = initialPrice*x + e^(slope*x)/slope - x
        const initialTermExp = initialPrice * supplyDelta;
        const slopeTermExp = (
          Math.exp(slope * (currentSupply + supplyDelta)) - Math.exp(slope * currentSupply)
        ) / slope;
        return initialTermExp + slopeTermExp - supplyDelta;

      case 'logarithmic':
        // ∫(initialPrice + slope*ln(x+1))dx = initialPrice*x + slope*[(x+1)*ln(x+1) - x]
        const initialTermLog = initialPrice * supplyDelta;
        const slopeTermLog = slope * (
          (currentSupply + supplyDelta + 1) * Math.log(currentSupply + supplyDelta + 1)
          - (currentSupply + 1) * Math.log(currentSupply + 1)
          - supplyDelta
        );
        return initialTermLog + slopeTermLog;

      default:
        // Approximate using trapezoidal rule
        return (currentPrice + newPrice) * supplyDelta / 2;
    }
  };

  const calculateBurnReturn = (supplyDelta) => {
    if (supplyDelta > currentSupply) {
      throw new Error('Cannot burn more tokens than exist');
    }

    if (curveType === 'bancor') {
      // For bancor-style curves
      const newSupply = currentSupply - supplyDelta;
      return currentReserve * (1 - (newSupply / currentSupply) ** (1 / reserveRatio));
    }

    // For other curves, we can use the mint formula but in reverse
    return calculateMintCost(-supplyDelta);
  };

  return {
    currentSupply,
    currentReserve,

    // Get current spot price
    getCurrentPrice() {
      return calculatePrice(currentSupply);
    },

    // Mint new tokens
    mint(tokenAmount) {
      if (tokenAmount <= 0) {
        throw new Error('Amount must be positive');
      }

      const cost = calculateMintCost(tokenAmount);

      // Update state
      currentSupply += tokenAmount;
      currentReserve += cost;

      return {
        tokensMinted: tokenAmount,
        reservePaid: cost,
        newSupply: currentSupply,
        newReserve: currentReserve,
        newPrice: calculatePrice(currentSupply)
      };
    },

    // Burn tokens
    burn(tokenAmount) {
      if (tokenAmount <= 0) {
        throw new Error('Amount must be positive');
      }

      if (tokenAmount > currentSupply) {
        throw new Error('Cannot burn more tokens than exist');
      }

      const returnAmount = calculateBurnReturn(tokenAmount);

      // Update state
      currentSupply -= tokenAmount;
      currentReserve -= returnAmount;

      return {
        tokensBurned: tokenAmount,
        reserveReturned: returnAmount,
        newSupply: currentSupply,
        newReserve: currentReserve,
        newPrice: calculatePrice(currentSupply)
      };
    },

    // Simulate price impact
    simulatePriceImpact(tokenAmount, isBuy) {
      const currentPrice = calculatePrice(currentSupply);
      let newPrice;

      if (isBuy) {
        newPrice = calculatePrice(currentSupply + tokenAmount);
      } else {
        if (tokenAmount > currentSupply) {
          throw new Error('Cannot burn more tokens than exist');
        }
        newPrice = calculatePrice(currentSupply - tokenAmount);
      }

      const priceImpact = (newPrice - currentPrice) / currentPrice;

      return {
        currentPrice,
        newPrice,
        priceImpact,
        priceImpactPercentage: priceImpact * 100
      };
    }
  };
};

/**
 * Calculate reward distribution for proof-of-stake networks
 * @param {Object} params - Staking parameters
 * @returns {Object} - Staking reward model
 */
cryptoeconomics.createStakingModel = function (params = {}) {
  const {
    totalSupply = 100000000,
    totalStaked = 50000000,
    annualInflation = 0.05, // 5% annual inflation
    validatorCount = 100,
    minimumStake = 10000,
    slashingRates = { downtime: 0.01, doubleSigning: 0.05 }
  } = params;

  const annualRewards = totalSupply * annualInflation;
  const baseAnnualYield = annualRewards / totalStaked;

  return {
    totalSupply,
    totalStaked,
    annualInflation,
    validatorCount,
    minimumStake,
    slashingRates,

    // Calculate reward for a specific stake amount
    calculateReward(stakedAmount, periodInDays = 365) {
      if (stakedAmount < minimumStake) {
        throw new Error(`Staked amount must be at least ${minimumStake}`);
      }

      const annualReward = stakedAmount * baseAnnualYield;
      const periodicReward = annualReward * (periodInDays / 365);

      return {
        stakedAmount,
        annualReward,
        periodicReward,
        annualYieldPercentage: baseAnnualYield * 100,
        effectiveAPY: (1 + baseAnnualYield) ** 1 - 1
      };
    },

    // Calculate slashing penalty
    calculateSlashing(stakedAmount, violationType) {
      if (!slashingRates[violationType]) {
        throw new Error(`Unknown violation type: ${violationType}`);
      }

      const slashingAmount = stakedAmount * slashingRates[violationType];

      return {
        stakedAmount,
        violationType,
        slashingRate: slashingRates[violationType],
        slashingAmount,
        remainingStake: stakedAmount - slashingAmount
      };
    },

    // Calculate network security parameters
    calculateSecurityMetrics() {
      // Cost of attacking the network (e.g., 51% attack)
      const attackCost = totalStaked * 0.51; // simplified

      // Nakamoto coefficient (min validators to reach 33% stake)
      // Assuming all validators have equal stake for simplification
      const validatorStake = totalStaked / validatorCount;
      const nakamotuCoefficient = Math.ceil(0.33 * totalStaked / validatorStake);

      return {
        stakingRatio: totalStaked / totalSupply,
        attackCost,
        attackCostPercentage: attackCost / totalSupply * 100,
        nakamotuCoefficient
      };
    }
  };
};

module.exports = cryptoeconomics;
