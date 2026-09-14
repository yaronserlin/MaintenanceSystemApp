import { formatUserName, getUserInitials } from './formatUtils';

describe('formatUtils', () => {
    describe('formatUserName', () => {
        it('handles null, undefined, non-string, or empty input', () => {
            expect(formatUserName()).toBe('');
            expect(formatUserName(null)).toBe('');
            expect(formatUserName(undefined)).toBe('');
            expect(formatUserName(123)).toBe('');
            expect(formatUserName('')).toBe('');
            expect(formatUserName('   ')).toBe('');
        });

        it('capitalizes lowercase first and last name', () => {
            expect(formatUserName('john doe')).toBe('John Doe');
        });

        it('converts uppercase first and last name to proper title case', () => {
            expect(formatUserName('JOHN DOE')).toBe('John Doe');
        });

        it('handles mixed case and multiple whitespace', () => {
            expect(formatUserName('  jOhN   dOE  ')).toBe('John Doe');
        });

        it('capitalizes single names', () => {
            expect(formatUserName('alice')).toBe('Alice');
            expect(formatUserName('BOB')).toBe('Bob');
        });

        it('capitalizes multi-part names (first, middle, last)', () => {
            expect(formatUserName('john fitzgerald kennedy')).toBe('John Fitzgerald Kennedy');
        });

        it('handles hyphenated names correctly', () => {
            expect(formatUserName('mary-jane watson')).toBe('Mary-Jane Watson');
            expect(formatUserName('JEAN-LUC PICARD')).toBe('Jean-Luc Picard');
        });
    });

    describe('getUserInitials', () => {
        it('returns fallback initial for empty or invalid input', () => {
            expect(getUserInitials()).toBe('U');
            expect(getUserInitials(null)).toBe('U');
            expect(getUserInitials('')).toBe('U');
        });

        it('returns first letter for single names', () => {
            expect(getUserInitials('john')).toBe('J');
        });

        it('returns first and last letter initials for full names', () => {
            expect(getUserInitials('john doe')).toBe('JD');
            expect(getUserInitials('John Fitzgerald Kennedy')).toBe('JK');
        });
    });
});
