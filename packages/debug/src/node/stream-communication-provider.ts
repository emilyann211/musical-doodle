/********************************************************************************
 * Copyright (C) 2021 Red Hat, Inc. and others.
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

import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { Emitter, Event } from '@theia/core/lib/common/event';
import * as stream from 'stream';
import { CommunicationProvider } from './debug-model';

export class StreamCommunicationProvider extends DisposableCollection implements CommunicationProvider {
    private messageReceivedEmitter = new Emitter<string>();
    onMessageReceived: Event<string> = this.messageReceivedEmitter.event;
    private errorEmitter = new Emitter<Error>();
    onError: Event<Error> = this.errorEmitter.event;
    private closeEmitter = new Emitter<void>();
    onClose: Event<void> = this.closeEmitter.event;

    // these constants are for the message header, see: https://microsoft.github.io/debug-adapter-protocol/overview#header-part
    private static TWO_CRLF = '\r\n\r\n';
    private static CONTENT_LENGTH = 'Content-Length';
    private contentLength: number = -1;
    private buffer: Buffer = Buffer.alloc(0);

    constructor(private fromAdapter: stream.Readable, private toAdapter: stream.Writable) {
        super();

        this.fromAdapter.on('data', (data: Buffer) => this.handleData(data));
        this.fromAdapter.on('close', () => this.closeEmitter.fire()); // FIXME pass a proper exit code
        this.fromAdapter.on('error', error => this.errorEmitter.fire(error));
        this.toAdapter.on('error', error => this.errorEmitter.fire(error));
    };

    send(message: string): void {
        const msg = `${StreamCommunicationProvider.CONTENT_LENGTH}: ${Buffer.byteLength(message, 'utf8')}${StreamCommunicationProvider.TWO_CRLF}${message}`;

        this.toAdapter.write(msg, 'utf8');
    }

    protected handleData(data: Buffer): void {
        this.buffer = Buffer.concat([this.buffer, data]);

        while (true) {
            if (this.contentLength >= 0) {
                if (this.buffer.length >= this.contentLength) {
                    const message = this.buffer.toString('utf8', 0, this.contentLength);
                    this.buffer = this.buffer.slice(this.contentLength);
                    this.contentLength = -1;

                    if (message.length > 0) {
                        this.messageReceivedEmitter.fire(message);
                    }
                    continue; // there may be more complete messages to process
                }
            } else {
                let idx = this.buffer.indexOf(StreamCommunicationProvider.CONTENT_LENGTH);
                if (idx > 0) {
                    // log unrecognized output
                    const output = this.buffer.slice(0, idx);
                    console.log(output.toString('utf-8'));

                    this.buffer = this.buffer.slice(idx);
                }

                idx = this.buffer.indexOf(StreamCommunicationProvider.TWO_CRLF);
                if (idx !== -1) {
                    const header = this.buffer.toString('utf8', 0, idx);
                    const lines = header.split('\r\n');
                    for (let i = 0; i < lines.length; i++) {
                        const pair = lines[i].split(/: +/);
                        if (pair[0] === StreamCommunicationProvider.CONTENT_LENGTH) {
                            this.contentLength = +pair[1];
                        }
                    }
                    this.buffer = this.buffer.slice(idx + StreamCommunicationProvider.TWO_CRLF.length);
                    continue;
                }
            }
            break;
        }
    }
}
