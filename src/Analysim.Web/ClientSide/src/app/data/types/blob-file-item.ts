import { BlobFile } from '@data/types/blob-file';

export interface BlobFileItem {
    type: string
    name: string
    file: BlobFile
    defaultroute: string
    redirect: string
    order: number
}
