const languagesExtensionsDictionary = {
  js: 'javascript',
  ts: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  md: 'markdown',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
} as const;

type LanguageExtensionsDictionary = typeof languagesExtensionsDictionary;
type LanguageExtension = keyof typeof languagesExtensionsDictionary;

export const getLanguageFromFilename = (
  filename: string,
): LanguageExtensionsDictionary[LanguageExtension] => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return languagesExtensionsDictionary[extension as LanguageExtension] ?? '';
};

export const isExtensionSupported = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (filename.endsWith('.lock.json') || filename.endsWith('-lock.yaml')) {
    return false;
  }

  return Object.keys(languagesExtensionsDictionary).includes(
    extension as LanguageExtension,
  );
};
