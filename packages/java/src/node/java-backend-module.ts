/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '@theia/core/lib/common';
import { CliContribution } from '@theia/core/lib/node/cli';
import { LanguageServerContribution } from '@theia/languages/lib/node';
import { JavaContribution } from './java-contribution';
import { JavaCliContribution } from './java-cli-contribution';
import { JavaExtensionContribution } from './java-extension-model';

export default new ContainerModule(bind => {
    bind(JavaContribution).toSelf().inSingletonScope();
    bind(LanguageServerContribution).toService(JavaContribution);
    bind(JavaCliContribution).toSelf().inSingletonScope();
    bind(CliContribution).toService(JavaCliContribution);

    bindContributionProvider(bind, JavaExtensionContribution);
});
