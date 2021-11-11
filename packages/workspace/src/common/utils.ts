/********************************************************************************
 * Copyright (C) 2018 Ericsson and others.
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

// TODO get rid of util files, replace with methods in a responsible class

import URI from '@theia/core/lib/common/uri';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';

export const THEIA_EXT = 'theia-workspace';
export const VSCODE_EXT = 'code-workspace';

/**
 * @deprecated since 1.4.0 - because of https://github.com/eclipse-theia/theia/wiki/Coding-Guidelines#di-function-export, use `WorkspaceService.getUntitledWorkspace` instead
 */
export async function getTemporaryWorkspaceFileUri(envVariableServer: EnvVariablesServer): Promise<URI> {
    const configDirUri = await envVariableServer.getConfigDirUri();
    return new URI(configDirUri).resolve(`Untitled.${THEIA_EXT}`);
}
