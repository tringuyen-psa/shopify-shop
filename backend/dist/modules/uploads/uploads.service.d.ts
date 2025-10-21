import { ConfigService } from '@nestjs/config';
import 'express-serve-static-core';
export interface UploadedFile {
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    path: string;
}
export interface UploadOptions {
    folder?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    generateThumbnail?: boolean;
}
export declare class UploadsService {
    private readonly configService;
    private readonly logger;
    private readonly uploadDir;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private ensureUploadDir;
    uploadFile(file: Express.Multer.File, options?: UploadOptions): Promise<UploadedFile>;
    uploadMultipleFiles(files: Express.Multer.File[], options?: UploadOptions): Promise<UploadedFile[]>;
    deleteFile(fileId: string, folder?: string): Promise<boolean>;
    deleteMultipleFiles(fileIds: string[], folder?: string): Promise<{
        success: string[];
        failed: string[];
    }>;
    getFileUrl(fileId: string, folder?: string): Promise<string | null>;
    getFileInfo(fileId: string, folder?: string): Promise<UploadedFile | null>;
    listFiles(folder?: string): Promise<UploadedFile[]>;
    private validateFile;
    uploadProductImages(files: Express.Multer.File[], productId: string): Promise<UploadedFile[]>;
    uploadShopLogo(file: Express.Multer.File, shopId: string): Promise<UploadedFile>;
    uploadUserAvatar(file: Express.Multer.File, userId: string): Promise<UploadedFile>;
    uploadDocument(file: Express.Multer.File, category: string, entityId: string): Promise<UploadedFile>;
    cleanupOldFiles(daysOld?: number): Promise<number>;
    getStorageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        directoryUsage: Record<string, {
            files: number;
            size: number;
        }>;
    }>;
}
