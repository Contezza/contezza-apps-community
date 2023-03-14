enum ContezzaRuleLogicOperator {
    And = '&',
    Or = '|',
    Not = '!',
}

enum ContezzaRuleSyntax {
    Equal = '=',
    OpenBracket = '(',
    ClosedBracket = ')',
    True = 'true',
    False = 'false',
    Null = 'null',
    Undefined = 'undefined',
    EmptyString = '',
}

export class ContezzaRule {
    private readonly rule: string;

    private readonly EQUAL_OPERATOR = ContezzaRuleSyntax.Equal;

    private readonly AND_OPERATOR = ContezzaRuleLogicOperator.And;
    private readonly OR_OPERATOR = ContezzaRuleLogicOperator.Or;
    private readonly NOT_OPERATOR = ContezzaRuleLogicOperator.Not;
    private readonly SEPARATORS = [this.AND_OPERATOR, this.OR_OPERATOR];

    private readonly OPEN_BRACKET = ContezzaRuleSyntax.OpenBracket;
    private readonly CLOSED_BRACKET = ContezzaRuleSyntax.ClosedBracket;

    private readonly TRUE_VALUE = ContezzaRuleSyntax.True;
    private readonly FALSE_VALUE = ContezzaRuleSyntax.False;
    private readonly FALSY_VALUES: string[] = [ContezzaRuleSyntax.False, ContezzaRuleSyntax.Null, ContezzaRuleSyntax.Undefined, ContezzaRuleSyntax.EmptyString];

    constructor(rule: string) {
        this.rule = rule.trim();
    }

    evaluate(): boolean {
        const parsedRule = this.parse();
        if (parsedRule?.length) {
            const [separator, rule1, rule2] = parsedRule;
            switch (separator) {
                case this.AND_OPERATOR:
                    return rule1.evaluate() && rule2.evaluate();
                case this.OR_OPERATOR:
                    return rule1.evaluate() || rule2.evaluate();
                case this.NOT_OPERATOR:
                    return !rule1.evaluate();
                default:
                    return rule1.evaluate();
            }
        } else {
            return this.evaluateElementary();
        }
    }

    private parse(): [ContezzaRuleLogicOperator?, ...ContezzaRule[]] {
        let openBracketCounter = 0;
        let closedBracketCounter = 0;
        let char = '';
        for (let i = 0; i < this.rule.length; i++) {
            char = this.rule[i];
            if (char === this.OPEN_BRACKET) {
                openBracketCounter++;
            }
            if (char === this.CLOSED_BRACKET) {
                closedBracketCounter++;
            }
            if (openBracketCounter === closedBracketCounter) {
                if (this.SEPARATORS.includes(char as ContezzaRuleLogicOperator)) {
                    return [char as ContezzaRuleLogicOperator, new ContezzaRule(this.rule.slice(0, i)), new ContezzaRule(this.rule.slice(i + 1))];
                }
            }
        }
        if (this.rule.startsWith(this.NOT_OPERATOR)) {
            return [this.NOT_OPERATOR, new ContezzaRule(this.rule.slice(1))];
        }
        if (openBracketCounter > 0) {
            return [undefined, new ContezzaRule(this.rule.slice(1, -1))];
        }
        return [];
    }

    private evaluateElementary(): boolean {
        if (this.rule === this.TRUE_VALUE) {
            return true;
        }
        if (this.rule === this.FALSE_VALUE) {
            return false;
        }
        const [a, b] = this.rule.split(this.EQUAL_OPERATOR);
        return b ? a === b : !this.FALSY_VALUES.includes(a);
    }
}
