/********************************************************************************
 * Copyright (C) 2020 TypeFox and others.
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

import { ContainerModule } from '@theia/core/shared/inversify';
import { VSXExtensionResolver } from './vsx-extension-resolver';
import { PluginDeployerResolver } from '@theia/plugin-ext/lib/common/plugin-protocol';
import { VSXEnvironment } from '../common/vsx-environment';
import { OVSXAsyncClient } from '../common/ovsx-async-client';

export default new ContainerModule(bind => {
    bind(VSXEnvironment).toSelf().inSingletonScope();
    bind(OVSXAsyncClient).toDynamicValue(ctx => {
        const vsxEnvironment = ctx.container.get(VSXEnvironment);
        return new OVSXAsyncClient(Promise.all([
            vsxEnvironment.getVscodeApiVersion(),
            vsxEnvironment.getRegistryApiUri()
        ]).then(([apiVersion, apiUri]) => ({
            apiVersion,
            apiUrl: apiUri.toString()
        })));
    }).inSingletonScope();
    bind(VSXExtensionResolver).toSelf().inSingletonScope();
    bind(PluginDeployerResolver).toService(VSXExtensionResolver);
});
