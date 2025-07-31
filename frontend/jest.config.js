// jest.config.js
export default 'jsdom';
export const transform = {
    '^.+\\.jsx?$': 'babel-jest'
};
export const moduleFileExtensions = ['js', 'jsx'];
