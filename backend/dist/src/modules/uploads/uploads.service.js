"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const path = require("path");
const fs = require("fs");
let UploadsService = UploadsService_1 = class UploadsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadsService_1.name);
        this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
        this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
        this.ensureUploadDir();
    }
    ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(file, options = {}) {
        try {
            this.validateFile(file);
            const fileId = (0, uuid_1.v4)();
            const extension = path.extname(file.originalname);
            const filename = `${fileId}${extension}`;
            let folderPath = this.uploadDir;
            if (options.folder) {
                folderPath = path.join(this.uploadDir, options.folder);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }
            }
            const filePath = path.join(folderPath, filename);
            fs.writeFileSync(filePath, file.buffer);
            const relativePath = path.relative(this.uploadDir, filePath);
            const url = `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
            const uploadedFile = {
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
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async uploadMultipleFiles(files, options = {}) {
        const uploadedFiles = [];
        for (const file of files) {
            try {
                const uploadedFile = await this.uploadFile(file, options);
                uploadedFiles.push(uploadedFile);
            }
            catch (error) {
                this.logger.error(`Failed to upload file ${file.originalname}: ${error.message}`, error);
            }
        }
        if (uploadedFiles.length === 0 && files.length > 0) {
            throw new common_1.BadRequestException('Failed to upload any files');
        }
        return uploadedFiles;
    }
    async deleteFile(fileId, folder) {
        try {
            let searchPath = this.uploadDir;
            if (folder) {
                searchPath = path.join(this.uploadDir, folder);
            }
            const files = fs.readdirSync(searchPath);
            const targetFile = files.find(file => file.startsWith(fileId));
            if (!targetFile) {
                throw new common_1.BadRequestException('File not found');
            }
            const filePath = path.join(searchPath, targetFile);
            fs.unlinkSync(filePath);
            this.logger.log(`File deleted successfully: ${targetFile}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`, error);
            return false;
        }
    }
    async deleteMultipleFiles(fileIds, folder) {
        const result = { success: [], failed: [] };
        for (const fileId of fileIds) {
            const success = await this.deleteFile(fileId, folder);
            if (success) {
                result.success.push(fileId);
            }
            else {
                result.failed.push(fileId);
            }
        }
        return result;
    }
    async getFileUrl(fileId, folder) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get file URL: ${error.message}`, error);
            return null;
        }
    }
    async getFileInfo(fileId, folder) {
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
                originalName: targetFile,
                mimetype: 'application/octet-stream',
                size: stats.size,
                url: `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
                path: filePath,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get file info: ${error.message}`, error);
            return null;
        }
    }
    async listFiles(folder) {
        try {
            let searchPath = this.uploadDir;
            if (folder) {
                searchPath = path.join(this.uploadDir, folder);
            }
            if (!fs.existsSync(searchPath)) {
                return [];
            }
            const files = fs.readdirSync(searchPath);
            const uploadedFiles = [];
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
        }
        catch (error) {
            this.logger.error(`Failed to list files: ${error.message}`, error);
            return [];
        }
    }
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
        }
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
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }
    async uploadProductImages(files, productId) {
        return this.uploadMultipleFiles(files, {
            folder: `products/${productId}`,
            generateThumbnail: true,
        });
    }
    async uploadShopLogo(file, shopId) {
        return this.uploadFile(file, {
            folder: `shops/${shopId}`,
        });
    }
    async uploadUserAvatar(file, userId) {
        return this.uploadFile(file, {
            folder: `users/${userId}`,
        });
    }
    async uploadDocument(file, category, entityId) {
        return this.uploadFile(file, {
            folder: `documents/${category}/${entityId}`,
        });
    }
    async cleanupOldFiles(daysOld = 30) {
        try {
            const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
            let deletedCount = 0;
            const cleanupDirectory = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        cleanupDirectory(filePath);
                    }
                    else if (stats.mtime.getTime() < cutoffTime) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                }
            };
            cleanupDirectory(this.uploadDir);
            this.logger.log(`Cleaned up ${deletedCount} old files`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to cleanup old files: ${error.message}`, error);
            return 0;
        }
    }
    async getStorageStats() {
        try {
            const storageStats = {
                totalFiles: 0,
                totalSize: 0,
                directoryUsage: {},
            };
            const analyzeDirectory = (dir, relativePath = '') => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const fileStats = fs.statSync(filePath);
                    if (fileStats.isDirectory()) {
                        analyzeDirectory(filePath, path.join(relativePath, file));
                    }
                    else {
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
        }
        catch (error) {
            this.logger.error(`Failed to get storage stats: ${error.message}`, error);
            return {
                totalFiles: 0,
                totalSize: 0,
                directoryUsage: {},
            };
        }
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = UploadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map