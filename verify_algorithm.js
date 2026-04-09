const { calculateContentSimilarity, calculateInteractionScore } = require('./backend/utils/recommendationUtils');

console.log('--- Recommendation Algorithm Verification ---');

// 1. Content Similarity Tests
const testCases = [
    { u: ['React', 'Node'], i: ['React', 'Node'], expected: 1 },
    { u: ['React', 'Node'], i: ['React', 'Python'], expected: 0.5 },
    { u: ['React', 'Node'], i: ['Java', 'C++'], expected: 0 },
    { u: ['React', 'Node', 'Go'], i: ['React', 'Go'], expected: 0.816 }, // 2 / sqrt(3 * 2) = 2/2.45 = 0.816
    { u: [], i: ['React'], expected: 0 }
];

testCases.forEach((tc, index) => {
    const result = calculateContentSimilarity(tc.u, tc.i);
    const passed = Math.abs(result - tc.expected) < 0.01;
    console.log(`Test ${index + 1}: Similarity([${tc.u}] vs [${tc.i}]) = ${result.toFixed(3)} (Expected ${tc.expected}) - ${passed ? '✅' : '❌'}`);
});

// 2. Interaction Score Tests
const item = {
    views: ['u1', 'u2', 'u3', 'u4', 'u5'], // 5
    likes: ['u1', 'u2'], // 2
    saves: ['u3'], // 1
    followers: ['u4', 'u5', 'u6'] // 3
};

const weights = { views: 0.1, likes: 0.3, saves: 0.4, follows: 0.5 };
const expectedScore = (5 * 0.1) + (2 * 0.3) + (1 * 0.4) + (3 * 0.5); // 0.5 + 0.6 + 0.4 + 1.5 = 3.0
const score = calculateInteractionScore(item, weights);
console.log(`\nInteraction Score: ${score} (Expected ${expectedScore}) - ${score === expectedScore ? '✅' : '❌'}`);

console.log('\n--- Verification Complete ---');
