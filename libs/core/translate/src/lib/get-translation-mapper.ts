import { ContezzaObjectUtils } from '@contezza/core/utils';

import { Translation } from './models';

const concatIfExistsPath = (path: string, suffix: string): string => (path ? `${path}.${suffix}` : suffix);

const transformObjectToPath = <T extends Translation | string>(suffix: string, objectToTransformOrEndOfPath: T, path = ''): T =>
    typeof objectToTransformOrEndOfPath === 'object'
        ? ContezzaObjectUtils.fromEntries<any>(
              Object.entries(objectToTransformOrEndOfPath).map(([key, value]) => [key, transformObjectToPath(key, value, concatIfExistsPath(path, suffix))])
          )
        : concatIfExistsPath(path, suffix);

const _getTranslationMapper = <T extends Translation>(model: T): T => transformObjectToPath<T>('', model);

/**
 * Given a translation model returns the corresponding mapper,
 * i.e. a nested object having the same type as the model but with the value of all string-valued properties replaced by the corresponding key path.
 * E.g. if the model is
 * <pre>
 * const translationModel = {
 *     APP: {
 *         BROWSE: {
 *             TITLE: '',
 *             SIDENAV_LINK: {
 *                 LABEL: '',
 *                 TOOLTIP: '',
 *             },
 *             EMPTY_STATE: {
 *                 TITLE: '',
 *             },
 *         },
 *     },
 * };
 * </pre>
 * then this function returns
 * <pre>
 * const translationMapper = {
 *     APP: {
 *         BROWSE: {
 *             TITLE: 'APP.BROWSE.TITLE',
 *             SIDENAV_LINK: {
 *                 LABEL: 'APP.BROWSE.SIDENAV_LINK.LABEL',
 *                 TOOLTIP: 'APP.BROWSE.SIDENAV_LINK.TOOLTIP',
 *             },
 *             EMPTY_STATE: {
 *                 TITLE: 'APP.BROWSE.EMPTY_STATE.TITLE',
 *             },
 *         },
 *     },
 * };
 * </pre>
 * Properties of this mapper can then be used in angular templates as parameters of the `translate` pipe (instead of string keys),
 * allowing to check their validity at compilation time.
 * E.g.
 * <pre>
 *     {{ 'APP.BROWSE.TITLE' | translate}}
 * </pre>
 * can be replaced with
 * <pre>
 *     {{ translationModel.APP.BROWSE.TITLE | translate }}
 * </pre>
 *
 * @param model The translation model to be converted into a mapper.
 * @param prefix A prefix to be applied to each string value.
 */
export const getTranslationMapper = <T extends Translation>(model: T, prefix?: string): T =>
    prefix ? _getTranslationMapper({ [prefix]: model })[prefix]! : _getTranslationMapper(model);
