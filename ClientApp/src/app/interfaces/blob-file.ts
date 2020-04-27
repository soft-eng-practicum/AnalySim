export interface BlobFile {
    blobFileID?: number;
    container: string;
    directory: string;
    name: string;
    extension: string;
    size: number;
    uri: string;
    dateCreated: Date;
}