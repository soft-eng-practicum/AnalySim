using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Core.Helper
{
    /// <summary>
    /// Validates file uploads based on extension, MIME type, and file signature
    /// Uses an allowlist approach to prevent malicious file uploads
    /// </summary>
    public class FileTypeValidator
    {
        private readonly FileValidationSettings _settings;

        /// <summary>
        /// Magic numbers (file signatures) for common file types
        /// Used to verify that file content matches the claimed extension
        /// </summary>
        private static readonly Dictionary<byte[], string> FileMagicNumbers = new Dictionary<byte[], string>
        {
            { new byte[] { 0xFF, 0xD8, 0xFF }, ".jpg" },      // JPEG
            { new byte[] { 0x89, 0x50, 0x4E, 0x47 }, ".png" }, // PNG
            { new byte[] { 0x47, 0x49, 0x46 }, ".gif" },       // GIF
            { new byte[] { 0x52, 0x49, 0x46, 0x46 }, ".webp" }, // WEBP
            { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, ".xlsx" }, // XLSX (zip-based)
            { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, ".zip" },  // ZIP
            { new byte[] { 0x25, 0x50, 0x44, 0x46 }, ".pdf" },  // PDF
            { new byte[] { 0x7B, 0x0A }, ".json" },             // JSON (basic check)
            { new byte[] { 0x23, 0x0A }, ".ipynb" }             // Jupyter (text-based)
        };

        public FileTypeValidator(FileValidationSettings settings)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        /// <summary>
        /// Validates a profile image upload
        /// </summary>
        public (bool IsValid, string ErrorMessage) ValidateProfileImage(string fileName, byte[] fileContent)
        {
            return ValidateFile(fileName, fileContent, _settings.AllowedImageExtensions, maxSize: _settings.MaxProfileImageSize);
        }

        /// <summary>
        /// Validates a project file upload
        /// </summary>
        public (bool IsValid, string ErrorMessage) ValidateProjectFile(string fileName, byte[] fileContent)
        {
            return ValidateFile(fileName, fileContent, _settings.AllowedProjectFileExtensions, maxSize: _settings.MaxProjectFileSize);
        }

        /// <summary>
        /// Validates a notebook file upload
        /// </summary>
        public (bool IsValid, string ErrorMessage) ValidateNotebookFile(string fileName, byte[] fileContent)
        {
            // Notebooks must be .ipynb only
            var result = ValidateFile(fileName, fileContent, _settings.AllowedNotebookExtensions, maxSize: _settings.MaxNotebookFileSize);

            if (!result.IsValid)
                return result;

            // Additional validation: Notebooks should be JSON text files
            if (!IsValidJsonContent(fileContent))
                return (false, "Invalid Jupyter notebook format. Must be a valid JSON file.");

            return (true, string.Empty);
        }

        /// <summary>
        /// Generic file validation
        /// </summary>
        private (bool IsValid, string ErrorMessage) ValidateFile(
            string fileName,
            byte[] fileContent,
            List<string> allowedExtensions,
            int maxSize)
        {
            if (fileContent == null || fileContent.Length == 0)
                return (false, "File content is empty.");

            // Check file size
            if (fileContent.Length > maxSize)
                return (false, $"File size exceeds maximum allowed size of {maxSize} bytes.");

            // Get extension
            var extension = Path.GetExtension(fileName)?.ToLower();
            if (string.IsNullOrEmpty(extension))
                return (false, "File has no extension.");

            // Check if extension is blocked
            if (_settings.BlockedExtensions?.Contains(extension) == true)
                return (false, $"File type '{extension}' is not allowed.");

            // Check if extension is in allowlist
            if (!allowedExtensions.Contains(extension))
                return (false, $"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");

            // Verify file signature matches extension (magic number check)
            if (!VerifyFileSignature(fileContent, extension))
                return (false, $"File content does not match the file extension. Possible file type mismatch or corruption.");

            return (true, string.Empty);
        }

        /// <summary>
        /// Verifies file signature (magic number) matches the claimed extension
        /// </summary>
        private bool VerifyFileSignature(byte[] fileContent, string extension)
        {
            if (fileContent == null || fileContent.Length == 0)
                return false;

            // For text-based formats, perform basic validation
            if (extension == ".json" || extension == ".ipynb")
                return IsValidJsonContent(fileContent);

            if (extension == ".csv" || extension == ".txt" || extension == ".tsv" || extension == ".dat")
                return IsValidTextContent(fileContent);

            // For binary formats, check magic numbers
            foreach (var kvp in FileMagicNumbers)
            {
                if (fileContent.Length >= kvp.Key.Length &&
                    fileContent.Take(kvp.Key.Length).SequenceEqual(kvp.Key))
                {
                    return kvp.Value == extension || (kvp.Value == ".xlsx" && extension == ".xls");
                }
            }

            // If no magic number matched, assume it's okay for formats we can't verify
            // (like CSV, TXT, XML without specific magic numbers)
            if (extension == ".xml")
                return IsValidTextContent(fileContent) && fileContent.ToString().Contains("<");

            return true; // Allow if we can't determine a signature
        }

        /// <summary>
        /// Checks if file content is valid JSON
        /// </summary>
        private bool IsValidJsonContent(byte[] fileContent)
        {
            try
            {
                var text = System.Text.Encoding.UTF8.GetString(fileContent);
                var trimmed = text.Trim();

                // Basic JSON structure check
                return (trimmed.StartsWith("{") && trimmed.EndsWith("}")) ||
                       (trimmed.StartsWith("[") && trimmed.EndsWith("]"));
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Checks if file content is valid text
        /// </summary>
        private bool IsValidTextContent(byte[] fileContent)
        {
            try
            {
                // Attempt to decode as UTF-8
                var text = System.Text.Encoding.UTF8.GetString(fileContent);

                // Check for null characters (indicator of binary content)
                return !text.Contains("\0");
            }
            catch
            {
                return false;
            }
        }
    }
}
