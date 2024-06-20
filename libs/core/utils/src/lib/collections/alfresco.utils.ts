export class AlfrescoUtils {
    static readonly prefixSpacesStore = 'workspace://SpacesStore/';

    /**
     * Turns the given id into a noderef by prefixing it with `workspace://SpacesStore/`.
     * If the given parameter already is a noderef then it is immediately returned.
     * N.B.: the parameter is assumed to be either an uuid or a noderef, no check is performed.
     *
     * @param id
     */
    static toNoderef(id: string): string {
        return id.includes('/') ? id : AlfrescoUtils.prefixSpacesStore + id;
    }
}
