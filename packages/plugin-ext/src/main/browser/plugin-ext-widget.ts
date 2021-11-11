/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
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

import { injectable, inject } from 'inversify';
import { Message } from '@phosphor/messaging';
import { h, VirtualNode } from '@phosphor/virtualdom';
import { DisposableCollection } from '@theia/core';
import { VirtualWidget, VirtualRenderer, OpenerService } from '@theia/core/lib/browser';
import { HostedPluginServer, PluginMetadata } from '../../common/plugin-protocol';

@injectable()
export class PluginWidget extends VirtualWidget {

    protected plugins: PluginMetadata[] = [];
    protected readonly toDisposeOnFetch = new DisposableCollection();
    protected readonly toDisposeOnSearch = new DisposableCollection();
    protected ready = false;

    constructor(
        @inject(HostedPluginServer) protected readonly hostedPluginServer: HostedPluginServer,
        @inject(OpenerService) protected readonly openerService: OpenerService
    ) {
        super();
        this.id = 'plugins';
        this.title.label = 'Plugins';
        this.addClass('theia-plugins');

        this.update();
        this.fetchPlugins();
    }

    protected onActivateRequest(msg: Message) {
        super.onActivateRequest(msg);
        this.fetchPlugins();
        this.node.focus();
    }

    public refreshPlugins(): void {
        this.fetchPlugins();
    }

    protected fetchPlugins(): Promise<PluginMetadata[]> {
        const promise = this.hostedPluginServer.getDeployedMetadata();

        promise.then(pluginMetadatas => {
            this.plugins = pluginMetadatas;
            this.ready = true;
            this.update();
        });
        return promise;
    }

    protected render(): h.Child {
        if (this.ready) {
            return [this.renderPluginList()];
        } else {
            const spinner = h.div({ className: 'fa fa-spinner fa-pulse fa-3x fa-fw' }, '');
            return h.div({ className: 'spinnerContainer' }, spinner);
        }
    }

    protected renderPluginList(): VirtualNode {
        const theList: h.Child[] = [];
        this.plugins.forEach(plugin => {
            const container = this.renderPlugin(plugin);
            theList.push(container);
        });

        return h.div({
            id: 'pluginListContainer'
        },
            VirtualRenderer.flatten(theList));
    }

    private renderPlugin(plugin: PluginMetadata) {
        const icon = h.div({ className: 'fa fa-puzzle-piece fa-2x fa-fw' }, '');
        const name = h.div({
            title: plugin.model.name,
            className: 'pluginName noWrapInfo'
        }, plugin.model.name);

        const version = h.div({
            className: 'pluginVersion'
        }, plugin.model.version);

        const publisher = h.div({
            className: 'pluginPublisher noWrapInfo flexcontainer'
        }, plugin.model.publisher);

        const description = h.div({
            className: 'pluginDescription noWrapInfo'
        }, plugin.model.description);

        const leftColumn = this.renderColumn(
            'pluginInformationContainer',
            this.renderRow(icon, name),
            this.renderRow(version),
            this.renderRow(description),
            this.renderRow(publisher));

        return h.div({
            className: this.createPluginClassName(plugin),
            onclick: () => { }
        }, leftColumn);
    }

    protected createPluginClassName(plugin: PluginMetadata): string {
        const classNames = ['pluginHeaderContainer'];
        return classNames.join(' ');
    }

    protected renderRow(...children: h.Child[]): h.Child {
        return h.div({
            className: 'row flexcontainer'
        }, VirtualRenderer.flatten(children));
    }

    protected renderColumn(additionalClass?: string, ...children: h.Child[]): h.Child {
        return h.div({
            className: 'column flexcontainer ' + additionalClass
        }, VirtualRenderer.flatten(children));
    }

}
