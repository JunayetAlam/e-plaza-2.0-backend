import { deleteFromCloudinary, deleteMultipleByUrl, uploadMultipleToCloudinary, uploadToCloudinary } from "../Upload/uploadToCloudinary";

interface ImageData {
    name: string;
    url: string;
}



export function getImageDataFromUrl(imageUrl: string): ImageData {
    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1] || "unknown";

    return {
        name: fileName,
        url: imageUrl,
    };
}

export const uploadSingle = async (file: Express.Multer.File) => {
    const location = await uploadToCloudinary(file);
    const url = getImageDataFromUrl(location.Location);
    return url;
}

export const uploadMultiple = async (files: Express.Multer.File[]) => {
    const locations = await uploadMultipleToCloudinary(files);
    const urls = locations.map(item => getImageDataFromUrl(item.Location));
    return urls;
}

export const deleteSingle = async (url: string) => {
    await deleteFromCloudinary(url);
}

export const deleteMultiple = async (urls: string[]) => {
    await deleteMultipleByUrl(urls);
}

