/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
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

import { inject, injectable } from '@theia/core/shared/inversify';
import { IPty, spawn as spawnNodePty } from '@theia/node-pty';
import { NodePtyTerminal } from './node-pty-terminal';
import { Terminal, TerminalProcessInfo } from './terminal';
import { TerminalBufferFactory } from './terminal-buffer';
import { TerminalOptions, TerminalFactory, TerminalForkOptions, /* TerminalShellOptions, */ TerminalSpawnOptions } from './terminal-factory';

@injectable()
export class NodePtyTerminalFactory implements TerminalFactory {

    @inject(TerminalBufferFactory)
    protected terminalBufferFactory: TerminalBufferFactory;

    async spawn(options: TerminalSpawnOptions): Promise<Terminal> {
        const resolved = this.resolveSpawnOptions(options);
        const pty = spawnNodePty(resolved.executable, resolved.arguments, {
            cwd: resolved.cwd,
            env: resolved.env,
            cols: resolved.size.cols,
            rows: resolved.size.rows,
        });
        const info = this.getTerminalProcessInfo(pty, resolved);
        const buffer = this.terminalBufferFactory();
        return new NodePtyTerminal(info, pty, buffer);
    }

    async fork(options: TerminalForkOptions): Promise<Terminal> {
        const resolved = this.resolveForkOptions(options);
        return this.spawn({
            executable: resolved.execPath,
            arguments: [...resolved.execArgv, resolved.modulePath, ...resolved.arguments],
            cwd: resolved.cwd,
            env: resolved.env,
        });
    }

    // async shell(options: TerminalShellOptions): Promise<Terminal> {
    //     const resolved = this.resolveShellOptions(options);
    //     return this.spawn({
    //         executable: resolved.shellPath,
    //         arguments: [...resolved.shellArgv, resolved.commandLine],
    //         cwd: resolved.cwd,
    //         env: resolved.env,
    //     });
    // }

    protected resolveSpawnOptions(options: TerminalSpawnOptions): Required<TerminalSpawnOptions> {
        return {
            executable: options.executable,
            arguments: options.arguments ?? [],
            ...this.resolveCommonOptions(options),
        };
    }

    protected resolveForkOptions(options: TerminalForkOptions): Required<TerminalForkOptions> {
        return {
            modulePath: options.modulePath,
            arguments: options.arguments ?? [],
            execPath: options.execPath ?? process.execPath,
            execArgv: options.execArgv ?? this.getCurrentExecArgv(),
            ...this.resolveCommonOptions(options),
        };
    }

    // protected resolveShellOptions(options: TerminalShellOptions): Required<TerminalShellOptions> {
    //     return {
    //         shellPath: options.shellPath,
    //         shellArgv: options.shellArgv,
    //         commandLine: options.commandLine,
    //         ...this.resolveCommonOptions(options),
    //     };
    // }

    protected resolveCommonOptions(options: TerminalOptions): Required<TerminalOptions> {
        return {
            cwd: options.cwd ?? process.cwd(),
            env: options.env ?? this.getCurrentEnv(),
            size: { cols: undefined, rows: undefined },
        };
    }

    /**
     * Remove any `--inspect[-brk][=...]` parameter.
     */
    protected getCurrentExecArgv(): string[] {
        const execArgv: string[] = [];
        for (let i = 0; i < process.execArgv.length; i += 1) {
            const argv = process.execArgv[i];
            const match = argv.match(/^--inspect(-brk?)(=|$)/);
            if (match) {
                if (match[2] === '') {
                    i += 1; // offset to skip next argv
                }
                continue;
            }
            execArgv.push(argv);
        }
        return execArgv;
    }

    /**
     * Sanitizes the current environment by removing any empty or undefined value.
     */
    protected getCurrentEnv(): Record<string, string> {
        // eslint-disable-next-line no-null/no-null
        const env = Object.create(null);
        for (const [key, value] of Object.entries(process.env)) {
            if (value) {
                env[key] = value;
            }
        }
        return env;
    }

    protected getTerminalProcessInfo(pty: IPty, resolved: Required<TerminalSpawnOptions>): TerminalProcessInfo {
        return {
            pid: pty.pid,
            executable: resolved.executable,
            arguments: resolved.arguments,
            cwd: resolved.cwd,
            env: resolved.env,
        };
    }
}
