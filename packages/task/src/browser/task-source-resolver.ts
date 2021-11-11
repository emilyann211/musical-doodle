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

import { inject, injectable } from 'inversify';
import { TaskConfiguration, ContributedTaskConfiguration } from '../common';
import { TaskDefinitionRegistry } from './task-definition-registry';

@injectable()
export class TaskSourceResolver {
    @inject(TaskDefinitionRegistry)
    protected taskDefinitionRegistry: TaskDefinitionRegistry;

    /**
     * Returns task source to display.
     */
    resolve(task: TaskConfiguration): string | undefined {
        const isDetectedTask = this.isDetectedTask(task);
        let sourceFolderUri: string | undefined;
        if (isDetectedTask) {
            sourceFolderUri = task._scope;
        } else {
            sourceFolderUri = task._source;
        }
        return sourceFolderUri;
    }

    private isDetectedTask(task: TaskConfiguration): task is ContributedTaskConfiguration {
        return !!this.taskDefinitionRegistry.getDefinition(task);
    }
}
