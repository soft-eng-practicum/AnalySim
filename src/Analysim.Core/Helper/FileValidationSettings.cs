using System.Collections.Generic;

namespace Core.Helper
{
    /// <summary>
    /// Configuration settings for file validation
    /// Loaded from appsettings.json FileValidation section
    /// </summary>
    public class FileValidationSettings
    {
        /// <summary>
        /// Maximum size for profile image uploads in bytes (default: 5 MB)
        /// </summary>
        public int MaxProfileImageSize { get; set; } = 5 * 1024 * 1024; // 5 MB

        /// <summary>
        /// Maximum size for project file uploads in bytes (default: 100 MB)
        /// </summary>
        public int MaxProjectFileSize { get; set; } = 100 * 1024 * 1024; // 100 MB

        /// <summary>
        /// Maximum size for notebook file uploads in bytes (default: 50 MB)
        /// </summary>
        public int MaxNotebookFileSize { get; set; } = 50 * 1024 * 1024; // 50 MB

        /// <summary>
        /// Allowed file extensions for profile images
        /// </summary>
        public List<string> AllowedImageExtensions { get; set; } = new List<string>
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
        };

        /// <summary>
        /// Allowed file extensions for project data files
        /// </summary>
        public List<string> AllowedProjectFileExtensions { get; set; } = new List<string>
        {
            ".csv", ".json", ".txt", ".xlsx", ".xls", ".pdf", ".xml", ".tsv", ".dat"
        };

        /// <summary>
        /// Allowed file extensions for notebook files
        /// </summary>
        public List<string> AllowedNotebookExtensions { get; set; } = new List<string>
        {
            ".ipynb"
        };

        /// <summary>
        /// File extensions to block (dangerous executables and scripts)
        /// </summary>
        public List<string> BlockedExtensions { get; set; } = new List<string>
        {
            ".exe", ".bat", ".cmd", ".sh", ".ps1", ".app", ".dll", ".so", ".dmg",
            ".pkg", ".msi", ".deb", ".rpm", ".apk", ".zip", ".rar", ".7z", ".tar",
            ".gz", ".scr", ".vbs", ".js", ".py", ".rb", ".pl"
        };
    }
}
