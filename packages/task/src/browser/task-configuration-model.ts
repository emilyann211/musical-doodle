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

import URI from '@theia/core/lib/common/uri';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { TaskCustomization, TaskConfiguration } from '../common/task-protocol';
import { PreferenceService, PreferenceScope } from '@theia/core/lib/browser/preferences/preference-service';

export class TaskConfigurationModel implements Disposable {

    protected json: TaskConfigurationModel.JsonContent;

    protected readonly onDidChangeEmitter = new Emitter<void>();
    readonly onDidChange: Event<void> = this.onDidChangeEmitter.event;

    protected readonly toDispose = new DisposableCollection(
        this.onDidChangeEmitter
    );

    constructor(
        public readonly workspaceFolderUri: string,
        protected readonly preferences: PreferenceService
    ) {
        this.reconcile();
        this.toDispose.push(this.preferences.onPreferenceChanged(e => {
            if (e.preferenceName === 'tasks' && e.affects(workspaceFolderUri)) {
                this.reconcile();
            }
        }));
    }

    get uri(): URI | undefined {
        return this.json.uri;
    }

    dispose(): void {
        this.toDispose.dispose();
    }
    get onDispose(): Event<void> {
        return this.toDispose.onDispose;
    }

    get configurations(): (TaskCustomization | TaskConfiguration)[] {
        return this.json.configurations;
    }

    protected reconcile(): void {
        this.json = this.parseConfigurations();
        this.onDidChangeEmitter.fire(undefined);
    }

    setConfigurations(value: object): Promise<void> {
        return this.preferences.set('tasks.tasks', value, PreferenceScope.Folder, this.workspaceFolderUri);
    }

    protected parseConfigurations(): TaskConfigurationModel.JsonContent {
        const configurations: (TaskCustomization | TaskConfiguration)[] = [];
        // tslint:disable-next-line:no-any
        const { configUri, value } = this.preferences.resolve<any>('tasks', undefined, this.workspaceFolderUri);
        if (value && typeof value === 'object' && 'tasks' in value) {
            if (Array.isArray(value.tasks)) {
                for (const taskConfig of value.tasks) {
                    configurations.push(taskConfig);
                }
            }
        }
        return {
            uri: configUri,
            configurations
        };
    }

}
export namespace TaskConfigurationModel {
    export interface JsonContent {
        uri?: URI;
        configurations: (TaskCustomization | TaskConfiguration)[];
    }
}
