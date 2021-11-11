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

// tslint:disable:no-any

import * as path from 'path';
import * as fs from 'fs-extra';

const NLS_REGEX = /^%([\w\d.-]+)%$/i;

export async function loadManifest(pluginPath: string): Promise<any> {
    const [manifest, translations] = await Promise.all([
        fs.readJson(path.join(pluginPath, 'package.json')),
        loadTranslations(pluginPath)
    ]);
    return manifest && translations && Object.keys(translations).length ?
        localize(manifest, translations) :
        manifest;
}

async function loadTranslations(pluginPath: string): Promise<any> {
    try {
        return await fs.readJson(path.join(pluginPath, 'package.nls.json'));
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        return {};
    }
}

function localize(value: any, translations: {
    [key: string]: string
}): any {
    if (typeof value === 'string') {
        const match = NLS_REGEX.exec(value);
        return match && translations[match[1]] || value;
    }
    if (Array.isArray(value)) {
        const result = [];
        for (const item of value) {
            result.push(localize(item, translations));
        }
        return result;
    }
    if (value === null) {
        return value;
    }
    if (typeof value === 'object') {
        const result: { [key: string]: any } = {};
        // tslint:disable-next-line:forin
        for (const propertyName in value) {
            result[propertyName] = localize(value[propertyName], translations);
        }
        return result;
    }
    return value;
}
