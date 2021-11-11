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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable } from 'inversify';
import { MenuPath } from '../common/menu';
import { Disposable, DisposableCollection } from '../common/disposable';

export type Anchor = MouseEvent | { x: number, y: number };

export function toAnchor(anchor: HTMLElement | { x: number, y: number }): Anchor {
    return anchor instanceof HTMLElement ? { x: anchor.offsetLeft, y: anchor.offsetTop } : anchor;
}

export abstract class ContextMenuAccess implements Disposable {

    protected readonly toDispose = new DisposableCollection();
    readonly onDispose = this.toDispose.onDispose;

    constructor(toClose: Disposable) {
        this.toDispose.push(toClose);
    }

    get disposed(): boolean {
        return this.toDispose.disposed;
    }

    dispose(): void {
        this.toDispose.dispose();
    }

}

@injectable()
export abstract class ContextMenuRenderer {

    protected _current: ContextMenuAccess | undefined;
    protected readonly toDisposeOnSetCurrent = new DisposableCollection();
    /**
     * Currently opened context menu.
     * Rendering a new context menu will close the current.
     */
    get current(): ContextMenuAccess | undefined {
        return this._current;
    }
    protected setCurrent(current: ContextMenuAccess | undefined): void {
        if (this._current === current) {
            return;
        }
        this.toDisposeOnSetCurrent.dispose();
        this._current = current;
        if (current) {
            this.toDisposeOnSetCurrent.push(current.onDispose(() => {
                this._current = undefined;
            }));
            this.toDisposeOnSetCurrent.push(current);
        }
    }

    render(options: RenderContextMenuOptions): ContextMenuAccess {
        const access = this.doRender(options);
        this.setCurrent(access);
        return access;
    }

    protected abstract doRender(options: RenderContextMenuOptions): ContextMenuAccess;

}

export interface RenderContextMenuOptions {
    menuPath: MenuPath
    anchor: Anchor
    args?: any[]
    onHide?: () => void
}
