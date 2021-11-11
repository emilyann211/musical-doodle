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
import { TerminalWidgetImpl } from './terminal-widget-impl';
import { TerminalWidget } from '@theia/terminal/lib/browser/terminal-widget';
import { bindTerminalPreferences } from './terminal-preferences';

import '../../src/browser/terminal.css';
import 'xterm/lib/xterm.css';

// Todo rename to xterm.js-frontend-module
export default new ContainerModule(bind => {
    bindTerminalPreferences(bind);

    bind(TerminalWidget).to(TerminalWidgetImpl).inTransientScope();
});
