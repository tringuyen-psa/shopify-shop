import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { Express } from 'express';

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

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadedFile> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${fileId}${extension}`;

      // Create folder if specified
      let folderPath = this.uploadDir;
      if (options.folder) {
        folderPath = path.join(this.uploadDir, options.folder);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      }

      const filePath = path.join(folderPath, filename);

      // Move file to upload directory
      fs.writeFileSync(filePath, file.buffer);

      // Generate URL
      const relativePath = path.relative(this.uploadDir, filePath);
      const url = `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;

      const uploadedFile: UploadedFile = {
        id: fileId,
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url,
        path: filePath,
      };

      this.logger.log(`File uploaded successfully: ${uploadedFile.filename}`);
      return uploadedFile;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {},
  ): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      try {
        const uploadedFile = await this.uploadFile(file, options);
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}: ${error.message}`, error);
        // Continue with other files
      }
    }

    if (uploadedFiles.length === 0 && files.length > 0) {
      throw new BadRequestException('Failed to upload any files');
    }

    return uploadedFiles;
  }

  async deleteFile(fileId: string, folder?: string): Promise<boolean> {
    try {
      let searchPath = this.uploadDir;
      if (folder) {
        searchPath = path.join(this.uploadDir, folder);
      }

      // Find file by ID
      const files = fs.readdirSync(searchPath);
      const targetFile = files.find(file => file.startsWith(fileId));

      if (!targetFile) {
        throw new BadRequestException('File not found');
      }

      const filePath = path.join(searchPath, targetFile);
      fs.unlinkSync(filePath);

      this.logger.log(`File deleted successfully: ${targetFile}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error);
      return false;
    }
  }

  async deleteMultipleFiles(fileIds: string[], folder?: string): Promise<{ success: string[], failed: string[] }> {
    const result = { success: [], failed: [] };

    for (const fileId of fileIds) {
      const success = await this.deleteFile(fileId, folder);
      if (success) {
        result.success.push(fileId);
      } else {
        result.failed.push(fileId);
      }
    }

    return result;
  }

  async getFileUrl(fileId: string, folder?: string): Promise<string | null> {
    try {
      let searchPath = this.uploadDir;
      if (folder) {
        searchPath = path.join(this.uploadDir, folder);
      }

      const files = fs.readdirSync(searchPath);
      const targetFile = files.find(file => file.startsWith(fileId));

      if (!targetFile) {
        return null;
      }

      const relativePath = path.relative(this.uploadDir, path.join(searchPath, targetFile));
      return `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    } catch (error) {
      this.logger.error(`Failed to get file URL: ${error.message}`, error);
      return null;
    }
  }

  async getFileInfo(fileId: string, folder?: string): Promise<UploadedFile | null> {
    try {
      let searchPath = this.uploadDir;
      if (folder) {
        searchPath = path.join(this.uploadDir, folder);
      }

      const files = fs.readdirSync(searchPath);
      const targetFile = files.find(file => file.startsWith(fileId));

      if (!targetFile) {
        return null;
      }

      const filePath = path.join(searchPath, targetFile);
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(this.uploadDir, filePath);

      return {
        id: fileId,
        filename: targetFile,
        originalName: targetFile, // In a real implementation, you'd store this mapping
        mimetype: 'application/octet-stream', // In a real implementation, you'd store this
        size: stats.size,
        url: `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
        path: filePath,
      };
    } catch (error) {
      this.logger.error(`Failed to get file info: ${error.message}`, error);
      return null;
    }
  }

  async listFiles(folder?: string): Promise<UploadedFile[]> {
    try {
      let searchPath = this.uploadDir;
      if (folder) {
        searchPath = path.join(this.uploadDir, folder);
      }

      if (!fs.existsSync(searchPath)) {
        return [];
      }

      const files = fs.readdirSync(searchPath);
      const uploadedFiles: UploadedFile[] = [];

      for (const file of files) {
        const filePath = path.join(searchPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          const fileId = path.basename(file, path.extname(file));
          const relativePath = path.relative(this.uploadDir, filePath);

          uploadedFiles.push({
            id: fileId,
            filename: file,
            originalName: file,
            mimetype: 'application/octet-stream',
            size: stats.size,
            url: `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
            path: filePath,
          });
        }
      }

      return uploadedFiles.sort((a, b) => b.filename.localeCompare(a.filename));
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error);
      return [];
    }
  }

  private validateFile(file: Express.Multer.File) {
    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Check file type
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  // Product image uploads
  async uploadProductImages(
    files: Express.Multer.File[],
    productId: string,
  ): Promise<UploadedFile[]> {
    return this.uploadMultipleFiles(files, {
      folder: `products/${productId}`,
      generateThumbnail: true,
    });
  }

  // Shop logo uploads
  async uploadShopLogo(file: Express.Multer.File, shopId: string): Promise<UploadedFile> {
    return this.uploadFile(file, {
      folder: `shops/${shopId}`,
    });
  }

  // User avatar uploads
  async uploadUserAvatar(file: Express.Multer.File, userId: string): Promise<UploadedFile> {
    return this.uploadFile(file, {
      folder: `users/${userId}`,
    });
  }

  // Document uploads (KYC, contracts, etc.)
  async uploadDocument(
    file: Express.Multer.File,
    category: string,
    entityId: string,
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      folder: `documents/${category}/${entityId}`,
    });
  }

  // Cleanup old files
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      const cleanupDirectory = (dir: string) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            cleanupDirectory(filePath);
          } else if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      };

      cleanupDirectory(this.uploadDir);
      this.logger.log(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup old files: ${error.message}`, error);
      return 0;
    }
  }

  // Storage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    directoryUsage: Record<string, { files: number; size: number }>;
  }> {
    try {
      const storageStats = {
        totalFiles: 0,
        totalSize: 0,
        directoryUsage: {} as Record<string, { files: number; size: number }>,
      };

      const analyzeDirectory = (dir: string, relativePath = '') => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const fileStats = fs.statSync(filePath);

          if (fileStats.isDirectory()) {
            analyzeDirectory(filePath, path.join(relativePath, file));
          } else {
            storageStats.totalFiles++;
            storageStats.totalSize += fileStats.size;

            const dirKey = relativePath || 'root';
            if (!storageStats.directoryUsage[dirKey]) {
              storageStats.directoryUsage[dirKey] = { files: 0, size: 0 };
            }
            storageStats.directoryUsage[dirKey].files++;
            storageStats.directoryUsage[dirKey].size += fileStats.size;
          }
        }
      };

      analyzeDirectory(this.uploadDir);
      return storageStats;
    } catch (error) {
      this.logger.error(`Failed to get storage stats: ${error.message}`, error);
      return {
        totalFiles: 0,
        totalSize: 0,
        directoryUsage: {},
      };
    }
  }
}