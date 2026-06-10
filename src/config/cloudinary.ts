import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env } from "./env";

/**
 * ==============================
 * CLOUDINARY CONFIG
 * ==============================
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * ==============================
 * TYPES
 * ==============================
 */
export type CloudinaryResourceType = "image" | "video" | "raw";

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: CloudinaryResourceType;
  tags?: string[];
  overwrite?: boolean;
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * ==============================
 * BUILD SAFE OPTIONS
 * ==============================
 */
const buildUploadOptions = (options?: CloudinaryUploadOptions) => {
  const uploadOptions: Record<string, any> = {
    folder: options?.folder ?? env.CLOUDINARY_FOLDER,
    resource_type: options?.resource_type ?? "image",
    overwrite: options?.overwrite ?? true,
  };

  if (options?.public_id) {
    uploadOptions.public_id = options.public_id;
  }

  if (options?.tags) {
    uploadOptions.tags = options.tags;
  }

  return uploadOptions;
};

/**
 * ==============================
 * MAP RESPONSE
 * ==============================
 */
const mapCloudinaryResponse = (
  result: UploadApiResponse
): CloudinaryUploadResult => {
  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    resource_type: result.resource_type,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
  };
};

/**
 * ==============================
 * ERROR HANDLER (MUST RETURN NEVER)
 * ==============================
 */
const handleCloudinaryError = (
  error: unknown,
  message: string
): never => {
  console.error("❌ Cloudinary Error:", error);

  if (error instanceof Error) {
    throw new Error(`${message}: ${error.message}`);
  }

  throw new Error(message);
};

/**
 * ==============================
 * UPLOAD FROM FILE PATH
 * ==============================
 */
export const uploadToCloudinary = async (
  filePath: string,
  options?: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> => {
  try {
    const result: UploadApiResponse =
      await cloudinary.uploader.upload(
        filePath,
        buildUploadOptions(options)
      );

    return mapCloudinaryResponse(result);
  } catch (error) {
    handleCloudinaryError(error, "File Upload Failed");
  }

  // This makes TS to understand No undefined path exists
  throw new Error("Unreachable code");
};

/**
 * ==============================
 * UPLOAD FROM BUFFER
 * ==============================
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options?: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> => {
  try {
    const uploadOptions = buildUploadOptions(options);

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) {
            return reject(
              new Error(
                error?.message || "Cloudinary Buffer Upload Failed"
              )
            );
          }

          resolve(mapCloudinaryResponse(result));
        }
      );

      stream.end(buffer);
    });
  } catch (error) {
    handleCloudinaryError(error, "Buffer Upload Failed");
  }

   // This makes TS to understand No undefined path exists
  throw new Error("Unreachable code");
};

/**
 * ==============================
 * DELETE FILE
 * ==============================
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resource_type: CloudinaryResourceType = "image"
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });

    return result.result === "ok";
  } catch (error) {
    console.error("❌ Cloudinary Delete Error:", error);
    return false;
  }
};

/**
 * ==============================
 * OPTIMIZED URL
 * ==============================
 */
export const getOptimizedUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    crop: "auto",
    fetch_format: "auto",
    quality: options?.quality ?? "auto",
    width: options?.width,
    height: options?.height,
  });
};

/**
 * ==============================
 * EXPORT CLIENT
 * ==============================
 */
export { cloudinary };