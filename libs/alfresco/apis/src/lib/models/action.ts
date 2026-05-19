export interface ActionProcessorBody<TName extends string, TParameters, _TResponse = { result: unknown }> {
    actionDefinitionName: TName;
    actionedUponNode: string;
    parameterValues: TParameters;
}

export type ActionCreator<TName extends string, TParameters, TResponse> = (
    actionedUponNode: string,
    parameterValues: TParameters,
) => ActionProcessorBody<TName, TParameters, TResponse>;

export function createAction<TName extends string>(actionDefinitionName: TName) {
    return <TParameters, TResponse = { result: unknown }>(): ActionCreator<TName, TParameters, TResponse> =>
        (actionedUponNode: string, parameterValues: TParameters) => ({
            actionDefinitionName,
            actionedUponNode,
            parameterValues,
        });
}
