/**
 * Base contract for generating documentation links.
 */
export abstract class DocsService {
    getLicenseLink?(): string | null;
    getReleaseNotesLink?(version: string): string | null;
}
