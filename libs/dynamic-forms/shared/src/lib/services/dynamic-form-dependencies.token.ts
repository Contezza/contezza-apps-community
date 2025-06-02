import { InjectionToken } from '@angular/core';

import { ContezzaDynamicForm } from '../classes';

export const DYNAMIC_FORM_DEPENDENCIES = new InjectionToken<ContezzaDynamicForm['provideDependencies']>('dynamic-form-dependencies');
