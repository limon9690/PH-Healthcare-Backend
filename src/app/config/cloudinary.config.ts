import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteFromCloudinary = async (url: string) => {
  const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
  const match = url.match(regex);

  try {
    if (match && match[1]) {
    const publicId = match[1];

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete image from Cloudinary");
  }

}


// manually upload to cloudinary
export const uploadToCloudinary = async (buffer : Buffer, fileName: string) : Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(status.BAD_REQUEST, "Invalid file data");
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
        const fileNameWithoutExtension = fileName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");

        const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;

        const folder = extension === "pdf" ? "pdf" : "images";

        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({
            resource_type: "auto",
            public_id: uniqueName,
            folder: `ph-healthcare/${folder}`,
          }, (error, result) => {
            if (error) {
              return reject(new AppError(status.INTERNAL_SERVER_ERROR, "Cloudinary upload failed"));
            } else {
              resolve(result as UploadApiResponse);
            }
          }).end(buffer);
        });
}

export const cloudinaryUpload = cloudinary;