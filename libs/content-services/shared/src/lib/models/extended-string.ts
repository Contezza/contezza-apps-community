/**
 * Defines a string with extra metadata.
 */
export type ExtendedString =
    | string
    | {
          value: string;
          style?: any;
          /**
           * Carries info over de formatter that has been used to generate the value.
           * Useful in xlsx to define cells of type date.
           */
          formatter?: any;
      };
