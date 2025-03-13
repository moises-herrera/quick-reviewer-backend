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

const notSupportedExtensions: string[] = [
  'svg',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'ico',
  'webp',
  'tiff',
  'tif',
  'raw',
  'mp4',
  'mkv',
  'mov',
  'avi',
  'wmv',
  'flv',
  'webm',
  'mp3',
  'wav',
  'aac',
  'ogg',
  'flac',
  'opus',
  'm4a',
  'zip',
  'tar',
  'exe',
  '.lock',
];
const notSupportedSuffixes: string[] = [
  '-lock.json',
  '-lock.yaml',
  '-lock.yml',
];

type LanguageExtensionsDictionary = typeof languagesExtensionsDictionary;
type LanguageExtension = keyof typeof languagesExtensionsDictionary;

export const getLanguageFromFilename = (
  filename: string,
): LanguageExtensionsDictionary[LanguageExtension] => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return languagesExtensionsDictionary[extension as LanguageExtension] ?? '';
};

export const isExtensionSupported = (filename: string): boolean => {
  if (
    filename.startsWith('.github/') ||
    notSupportedExtensions.some((extension) =>
      filename.endsWith(`.${extension}`),
    ) ||
    notSupportedSuffixes.some((suffix) => filename.endsWith(`${suffix}`))
  ) {
    return false;
  }

  return true;
};
