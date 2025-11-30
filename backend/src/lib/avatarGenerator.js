/**
 * Avatar Generator Utility
 * Generates random cartoon avatars using DiceBear API
 * DiceBear is a free avatar library with multiple styles
 */

// Available avatar styles from DiceBear
const AVATAR_STYLES = [
    'adventurer',
    'adventurer-neutral',
    'avataaars',
    'avataaars-neutral',
    'big-ears',
    'big-ears-neutral',
    'big-smile',
    'bottts',
    'bottts-neutral',
    'croodles',
    'croodles-neutral',
    'fun-emoji',
    'icons',
    'identicon',
    'lorelei',
    'lorelei-neutral',
    'micah',
    'miniavs',
    'notionists',
    'notionists-neutral',
    'open-peeps',
    'personas',
    'pixel-art',
    'pixel-art-neutral',
    'rings',
    'shapes',
    'thumbs'
];

// Generate a random seed based on user email or unique identifier
const generateSeed = (email) => {
    // Create a unique but consistent seed based on email + timestamp
    // This ensures each user gets a unique avatar
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `${email}-${timestamp}-${randomNum}`;
};

// Get a random avatar style from the collection
const getRandomStyle = () => {
    const randomIndex = Math.floor(Math.random() * AVATAR_STYLES.length);
    return AVATAR_STYLES[randomIndex];
};

/**
 * Generate a random cartoon avatar URL
 * @param {string} email - User's email (used for generating unique seed)
 * @returns {string} Avatar URL
 */
export const generateRandomAvatar = (email) => {
    const style = getRandomStyle();
    const seed = generateSeed(email);
    
    // DiceBear API URL format
    // https://api.dicebear.com/7.x/{style}/svg?seed={seed}
    const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    
    return avatarUrl;
};

/**
 * Generate multiple avatar options for user to choose from
 * @param {string} email - User's email
 * @param {number} count - Number of avatars to generate (default: 5)
 * @returns {Array<Object>} Array of avatar objects with style and URL
 */
export const generateMultipleAvatars = (email, count = 5) => {
    const avatars = [];
    const usedStyles = new Set();
    
    while (avatars.length < count) {
        const style = getRandomStyle();
        
        // Avoid duplicate styles
        if (!usedStyles.has(style)) {
            usedStyles.add(style);
            const seed = generateSeed(email);
            const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
            
            avatars.push({
                style,
                url: avatarUrl
            });
        }
    }
    
    return avatars;
};

/**
 * Get a specific style avatar (for consistency)
 * @param {string} identifier - Unique identifier (email, userId, etc.)
 * @param {string} style - Avatar style (optional, uses random if not provided)
 * @returns {string} Avatar URL
 */
export const generateAvatarByStyle = (identifier, style = null) => {
    const avatarStyle = style || getRandomStyle();
    const seed = generateSeed(identifier);
    
    const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}`;
    
    return avatarUrl;
};

/**
 * Get all available avatar styles
 * @returns {Array<string>} List of all available styles
 */
export const getAvailableStyles = () => {
    return [...AVATAR_STYLES];
};
