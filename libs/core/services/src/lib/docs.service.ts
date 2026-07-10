/**
 * Base contract for generating documentation links.
 */
export abstract class DocsService {
    abstract getReleaseNotesLink(version: string): string;
}
