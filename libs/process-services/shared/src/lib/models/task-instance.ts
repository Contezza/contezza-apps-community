export interface Task {
    id: string;
    creator?: string | null;
    description?: string | null;
    isClaimable?: boolean;
    isEditable?: boolean;
    isPooled?: boolean;
    isReassignable?: boolean;
    isReleasable?: boolean;
    name?: string;
    outcome?: string | null;
    owner?: User;
    path?: string;
    properties?: Record<string, any>;
    propertyLabels?: Record<string, any>;
    state?: string;
    title?: string;
    type?: string;
    url?: string;
    workflowInstance?: WorkflowInstance;
    definition: TaskDefinition;
}

export interface TaskDefinition {
    id?: string;
    node?: TaskDefinitionNode;
    type?: TaskType;
    url?: string;
}

export interface TaskType {
    description?: string;
    name?: string;
    title?: string;
    url?: string;
}

export interface TaskDefinitionNode {
    description?: string;
    isTaskNode?: boolean;
    name?: string;
    title?: string;
    transitions?: Array<TaskDefinitionNodeTransition>;
}

export interface TaskDefinitionNodeTransition {
    description?: string;
    id?: string;
    isDefault?: boolean;
    isHidden?: boolean;
    title?: boolean;
}

export interface WorkflowInstance {
    context?: string | null;
    definitionUrl?: string;
    description?: string;
    dueDate?: string | null;
    endDate?: string | null;
    id: string;
    initiator?: User;
    isActive?: boolean;
    message?: string;
    name?: string;
    package?: string;
    priority?: number;
    startDate?: string;
    title?: string;
    url?: string;
}

export interface User {
    userName: string;
    firstName?: string;
    lastName?: string;
}
