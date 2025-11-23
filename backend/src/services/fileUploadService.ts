import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['products', 'users', 'dealers', 'blog', 'pages'];
subdirs.forEach(subdir => {
  const dir = path.join(uploadDir, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    // Determine subdirectory based on route or file type
    if (req.route?.path?.includes('products')) {
      uploadPath = path.join(uploadDir, 'products');
    } else if (req.route?.path?.includes('users')) {
      uploadPath = path.join(uploadDir, 'users');
    } else if (req.route?.path?.includes('dealers')) {
      uploadPath = path.join(uploadDir, 'dealers');
    } else if (req.route?.path?.includes('blog')) {
      uploadPath = path.join(uploadDir, 'blog');
    } else if (req.route?.path?.includes('pages')) {
      uploadPath = path.join(uploadDir, 'pages');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

export class FileUploadService {
  /**
   * Upload single file
   */
  static uploadSingle(fieldName: string) {
    return upload.single(fieldName);
  }

  /**
   * Upload multiple files
   */
  static uploadMultiple(fieldName: string, maxCount: number = 10) {
    return upload.array(fieldName, maxCount);
  }

  /**
   * Upload multiple fields
   */
  static uploadFields(fields: multer.Field[]) {
    return upload.fields(fields);
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file URL
   */
  static getFileUrl(filePath: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filePath}`;
  }

  /**
   * Resize image (placeholder for future implementation)
   */
  static async resizeImage(
    filePath: string,
    width: number,
    height: number,
    quality: number = 80
  ): Promise<string> {
    // This would typically use a library like sharp or jimp
    // For now, return the original path
    return filePath;
  }

  /**
   * Generate thumbnail (placeholder for future implementation)
   */
  static async generateThumbnail(filePath: string): Promise<string> {
    // This would typically generate a thumbnail version
    // For now, return the original path
    return filePath;
  }

  /**
   * Validate file
   */
  static validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Get file info
   */
  static getFileInfo(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: this.getFileUrl(file.path.replace(uploadDir + path.sep, '')),
    };
  }
}

// Initialize file upload service
export async function initializeFileUpload() {
  try {
    console.log('✅ File upload service initialized');
    console.log(`  - Upload directory: ${uploadDir}`);
    console.log(`  - Max file size: ${process.env.MAX_FILE_SIZE || '5MB'}`);
    console.log(`  - Allowed types: ${process.env.ALLOWED_FILE_TYPES || 'images only'}`);
  } catch (error) {
    console.error('❌ Failed to initialize file upload service:', error);
    throw error;
  }
}
