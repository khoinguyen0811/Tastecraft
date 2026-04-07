import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
})

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'culinaria/avatars'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error || !result) return reject(error)
        resolve(result.secure_url)
      })
      .end(buffer)
  })
}
