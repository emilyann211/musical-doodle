/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { interfaces } from 'inversify';
import { createPreferenceProxy, PreferenceProxy, PreferenceService, PreferenceContribution, PreferenceSchema } from '@theia/core/lib/browser';

export const ProblemConfigSchema: PreferenceSchema = {
    'type': 'object',
    'properties': {
        'problem.decorations.tabbar.enabled': {
            'type': 'boolean',
            'description': 'Show problem decorators (diagnostic markers) in the tab bars.',
            'default': true
        }
    }
};

export interface ProblemConfiguration {
    'problem.decorations.tabbar.enabled': boolean
}

export const ProblemPreferences = Symbol('ProblemPreferences');
export type ProblemPreferences = PreferenceProxy<ProblemConfiguration>;

export const createProblemPreferences = (preferences: PreferenceService): ProblemPreferences =>
    createPreferenceProxy(preferences, ProblemConfigSchema);

export const bindProblemPreferences = (bind: interfaces.Bind): void => {
    bind(ProblemPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get<PreferenceService>(PreferenceService);
        return createProblemPreferences(preferences);
    });
    bind(PreferenceContribution).toConstantValue({ schema: ProblemConfigSchema });
};
