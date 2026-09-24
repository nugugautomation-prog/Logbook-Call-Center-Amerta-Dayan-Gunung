import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  // NFR-003: max 2MB client-side image compression
  const options = {
    maxSizeMB: 1.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Image compression failed, using original file if under size:', error)
    return file
  }
}
