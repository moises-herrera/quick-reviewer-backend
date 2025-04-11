import {
  getLanguageFromFilename,
  isExtensionSupported,
} from 'src/common/utils/language-support';

describe('Language Support', () => {
  it('should return the correct language for a given file name', () => {
    const fileName = 'example.js';
    const expectedLanguage = 'javascript';
    const actualLanguage = getLanguageFromFilename(fileName);
    expect(actualLanguage).toBe(expectedLanguage);
  });

  it('should return an empty string for unsupported file extensions', () => {
    const fileName = 'example.unsupported';
    const expectedLanguage = '';
    const actualLanguage = getLanguageFromFilename(fileName);
    expect(actualLanguage).toBe(expectedLanguage);
  });

  it('should handle file names with multiple dots', () => {
    const fileName = 'example.test.js';
    const expectedLanguage = 'javascript';
    const actualLanguage = getLanguageFromFilename(fileName);
    expect(actualLanguage).toBe(expectedLanguage);
  });

  it('should return true if the file extension is supported', () => {
    const supportedFileName = 'example.js';

    expect(isExtensionSupported(supportedFileName)).toBe(true);
  });

  it('should return false for unsupported file extensions', () => {
    expect(isExtensionSupported('example.svg')).toBe(false);
    expect(isExtensionSupported('example.png')).toBe(false);
    expect(isExtensionSupported('package-lock.json')).toBe(false);
    expect(isExtensionSupported('package-lock.yaml')).toBe(false);
    expect(isExtensionSupported('package-lock.yml')).toBe(false);
  });
});
