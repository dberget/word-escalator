import fourLetterWords from './validWords.json';

export const getValidWords = () => {
    return new Set(fourLetterWords);
}; 