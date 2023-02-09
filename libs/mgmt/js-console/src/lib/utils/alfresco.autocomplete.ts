export const alfrescoAutocomplete = (monaco, value: string, methods: Record<string, Array<string>>) => {
    const matched = Object.keys(methods).filter((key) => !!new RegExp(`^(.*?)(${key})\s*\.\s*$`).test(value));

    return matched?.length
        ? methods[matched[0]].map((method) => ({
              label: method,
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: `${method}($1)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: null as any,
          }))
        : [];
};

export const alfrescoSnippets = (monaco, commands) => [
    ...Object.keys(commands.methods).map((method) => ({
        label: method,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: `Alfresco ${method} Object`,
        range: null as any,
    })),
];
