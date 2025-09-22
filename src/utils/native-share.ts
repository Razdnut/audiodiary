import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const shareContent = async (
  content: string,
  filename: string,
  mimeType: string,
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const path = `exports/${filename}`;
    await Filesystem.writeFile({
      path,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    const uriRes = await Filesystem.getUri({ path, directory: Directory.Cache });
    await Share.share({ title: filename, url: uriRes.uri, dialogTitle: filename });
    return true;
  } catch (e) {
    console.error('Native share failed', e);
    return false;
  }
};

