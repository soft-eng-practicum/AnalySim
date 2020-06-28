import { BlobFile } from './blob-file';

export interface BlobFileItem {
    type: string
    name: string
    file: BlobFile
    redirect: string
}