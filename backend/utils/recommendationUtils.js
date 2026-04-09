/**
 * recommendationUtils.js
 * 
 * Implements Hybrid Content-Based Filtering components:
 * 1. Content Similarity (Cosine Similarity)
 * 2. Interaction Score (Weighted Sum)
 */

/**
 * Calculates the cosine similarity between two skill vectors.
 * ContentSimilarity(U, I) = (U ⋅ I) / (||U|| * ||I||)
 * 
 * @param {Array<string>} userSkills - List of user's skills/interests
 * @param {Array<string>} itemSkills - List of item's skills/technologies/tags
 * @returns {number} Similarity score between 0 and 1
 */
function calculateContentSimilarity(userSkills, itemSkills) {
    if (!userSkills || !itemSkills || userSkills.length === 0 || itemSkills.length === 0) {
        return 0;
    }

    // Convert to lowercase for matching
    const uSkills = userSkills.map(s => s.toLowerCase());
    const iSkills = itemSkills.map(s => s.toLowerCase());

    // Create a unique set of all skills to define the vector space
    const allSkills = Array.from(new Set([...uSkills, ...iSkills]));

    // Build binary vectors
    const uVector = allSkills.map(skill => uSkills.includes(skill) ? 1 : 0);
    const iVector = allSkills.map(skill => iSkills.includes(skill) ? 1 : 0);

    // Calculate Dot Product (U ⋅ I)
    let dotProduct = 0;
    for (let i = 0; i < uVector.length; i++) {
        dotProduct += uVector[i] * iVector[i];
    }

    // Calculate Magnitudes (||U|| and ||I||)
    const uMagnitude = Math.sqrt(uVector.reduce((sum, val) => sum + (val * val), 0));
    const iMagnitude = Math.sqrt(iVector.reduce((sum, val) => sum + (val * val), 0));

    if (uMagnitude === 0 || iMagnitude === 0) return 0;

    // Cosine Similarity
    return dotProduct / (uMagnitude * iMagnitude);
}

/**
 * Calculates the interaction score based on weighted user engagement.
 * InteractionScore(I) = w1*V + w2*L + w3*S + w4*F
 * 
 * @param {Object} item - The post or profile object
 * @param {Object} weights - Custom weights for interaction signals
 * @returns {number} Weighted interaction score
 */
function calculateInteractionScore(item, weights = { views: 0.1, likes: 0.3, saves: 0.4, follows: 0.5 }) {
    if (!item) return 0;

    const views = (item.views && item.views.length) || 0;
    const likes = (item.likes && item.likes.length) || 0;
    const saves = (item.saves && item.saves.length) || 0;
    const follows = (item.followers && item.followers.length) || 0;

    return (
        (views * weights.views) +
        (likes * weights.likes) +
        (saves * weights.saves) +
        (follows * weights.follows)
    );
}

module.exports = {
    calculateContentSimilarity,
    calculateInteractionScore
};
