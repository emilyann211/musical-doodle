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

import '../../src/browser/style/index.css';
require('../../src/browser/style/materialcolors.css').use();
import 'font-awesome/css/font-awesome.min.css';
import 'file-icons-js/css/style.css';

import { ContainerModule } from 'inversify';
import {
    bindContributionProvider,
    SelectionService,
    ResourceResolver,
    CommandContribution, CommandRegistry, CommandService, commandServicePath,
    MenuModelRegistry, MenuContribution,
    MessageClient,
    InMemoryResources,
    messageServicePath
} from '../common';
import { KeybindingRegistry, KeybindingContext, KeybindingContribution } from './keybinding';
import { FrontendApplication, FrontendApplicationContribution, DefaultFrontendApplicationContribution } from './frontend-application';
import { DefaultOpenerService, OpenerService, OpenHandler } from './opener-service';
import { HttpOpenHandler } from './http-open-handler';
import { CommonFrontendContribution } from './common-frontend-contribution';
import {
    QuickOpenService, QuickCommandService, QuickCommandFrontendContribution, QuickOpenContribution,
    QuickOpenHandlerRegistry, CommandQuickOpenContribution, HelpQuickOpenHandler,
    QuickOpenFrontendContribution, PrefixQuickOpenService, QuickInputService
} from './quick-open';
import { LocalStorageService, StorageService } from './storage-service';
import { WidgetFactory, WidgetManager } from './widget-manager';
import {
    ApplicationShell, ApplicationShellOptions, DockPanelRenderer, TabBarRenderer,
    TabBarRendererFactory, ShellLayoutRestorer,
    SidePanelHandler, SidePanelHandlerFactory,
    SplitPositionHandler, DockPanelRendererFactory, ApplicationShellLayoutMigration, ApplicationShellLayoutMigrationError
} from './shell';
import { StatusBar, StatusBarImpl } from './status-bar/status-bar';
import { LabelParser } from './label-parser';
import { LabelProvider, LabelProviderContribution, DefaultUriLabelProviderContribution } from './label-provider';
import { PreferenceService } from './preferences';
import { ContextMenuRenderer } from './context-menu-renderer';
import { ThemeService, BuiltinThemeProvider } from './theming';
import { ConnectionStatusService, FrontendConnectionStatusService, ApplicationConnectionStatusContribution, PingService } from './connection-status-service';
import { DiffUriLabelProviderContribution } from './diff-uris';
import { ApplicationServer, applicationPath } from '../common/application-protocol';
import { WebSocketConnectionProvider } from './messaging';
import { AboutDialog, AboutDialogProps } from './about-dialog';
import { EnvVariablesServer, envVariablesPath, EnvVariable } from './../common/env-variables';
import { FrontendApplicationStateService } from './frontend-application-state';
import { JsonSchemaStore } from './json-schema-store';
import { TabBarToolbarRegistry, TabBarToolbarContribution, TabBarToolbarFactory, TabBarToolbar } from './shell/tab-bar-toolbar';
import { bindCorePreferences } from './core-preferences';
import { QuickPickServiceImpl } from './quick-open/quick-pick-service-impl';
import { QuickPickService, quickPickServicePath } from '../common/quick-pick-service';
import { ContextKeyService } from './context-key-service';
import { ResourceContextKey } from './resource-context-key';
import { KeyboardLayoutService } from './keyboard/keyboard-layout-service';
import { MimeService } from './mime-service';
import { ApplicationShellMouseTracker } from './shell/application-shell-mouse-tracker';
import { ViewContainer, ViewContainerIdentifier } from './view-container';
import { QuickViewService } from './quick-view-service';
import { QuickTitleBar } from './quick-open/quick-title-bar';
import { DialogOverlayService } from './dialogs';
import { ProgressLocationService } from './progress-location-service';
import { ProgressClient } from '../common/progress-service-protocol';
import { ProgressService } from '../common/progress-service';
import { DispatchingProgressClient } from './progress-client';
import { ProgressStatusBarItem } from './progress-status-bar-item';
import { TabBarDecoratorService, TabBarDecorator } from './shell/tab-bar-decorator';
import { ContextMenuContext } from './menu/context-menu-context';
import { bindResourceProvider, bindMessageService, bindPreferenceService } from './frontend-application-bindings';
import { ColorRegistry } from './color-registry';
import { ColorContribution, ColorApplicationContribution } from './color-application-contribution';
import { ExternalUriService } from './external-uri-service';
import { IconThemeService, NoneIconTheme } from './icon-theme-service';
import { IconThemeApplicationContribution, IconThemeContribution, DefaultFileIconThemeContribution } from './icon-theme-contribution';
import { TreeLabelProvider } from './tree/tree-label-provider';
import { ProgressBar } from './progress-bar';
import { ProgressBarFactory, ProgressBarOptions } from './progress-bar-factory';
import { CommandOpenHandler } from './command-open-handler';

export { bindResourceProvider, bindMessageService, bindPreferenceService };

ColorApplicationContribution.initBackground();

export const frontendApplicationModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const themeService = ThemeService.get();
    themeService.register(...BuiltinThemeProvider.themes);
    themeService.startupTheme();

    bind(NoneIconTheme).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(NoneIconTheme);
    bind(IconThemeService).toSelf().inSingletonScope();
    bindContributionProvider(bind, IconThemeContribution);
    bind(DefaultFileIconThemeContribution).toSelf().inSingletonScope();
    bind(IconThemeContribution).toService(DefaultFileIconThemeContribution);
    bind(IconThemeApplicationContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(IconThemeApplicationContribution);

    bind(ColorRegistry).toSelf().inSingletonScope();
    bindContributionProvider(bind, ColorContribution);
    bind(ColorApplicationContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ColorApplicationContribution);

    bind(FrontendApplication).toSelf().inSingletonScope();
    bind(FrontendApplicationStateService).toSelf().inSingletonScope();
    bind(DefaultFrontendApplicationContribution).toSelf();
    bindContributionProvider(bind, FrontendApplicationContribution);

    bind(ApplicationShellOptions).toConstantValue({});
    bind(ApplicationShell).toSelf().inSingletonScope();
    bind(SidePanelHandlerFactory).toAutoFactory(SidePanelHandler);
    bind(SidePanelHandler).toSelf();
    bind(SplitPositionHandler).toSelf().inSingletonScope();

    bindContributionProvider(bind, TabBarToolbarContribution);
    bind(TabBarToolbarRegistry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(TabBarToolbarRegistry);
    bind(TabBarToolbarFactory).toFactory(context => () => {
        const container = context.container.createChild();
        container.bind(TabBarToolbar).toSelf().inSingletonScope();
        return container.get(TabBarToolbar);
    });

    bind(DockPanelRendererFactory).toFactory(context => () => {
        const { container } = context;
        const tabBarToolbarRegistry = container.get(TabBarToolbarRegistry);
        const tabBarRendererFactory: () => TabBarRenderer = container.get(TabBarRendererFactory);
        const tabBarToolbarFactory: () => TabBarToolbar = container.get(TabBarToolbarFactory);
        return new DockPanelRenderer(tabBarRendererFactory, tabBarToolbarRegistry, tabBarToolbarFactory);
    });
    bind(DockPanelRenderer).toSelf();
    bind(TabBarRendererFactory).toFactory(context => () => {
        const contextMenuRenderer = context.container.get<ContextMenuRenderer>(ContextMenuRenderer);
        const decoratorService = context.container.get<TabBarDecoratorService>(TabBarDecoratorService);
        const iconThemeService = context.container.get<IconThemeService>(IconThemeService);
        return new TabBarRenderer(contextMenuRenderer, decoratorService, iconThemeService);
    });

    bindContributionProvider(bind, TabBarDecorator);
    bind(TabBarDecoratorService).toSelf().inSingletonScope();

    bindContributionProvider(bind, OpenHandler);
    bind(DefaultOpenerService).toSelf().inSingletonScope();
    bind(OpenerService).toService(DefaultOpenerService);

    bind(ExternalUriService).toSelf().inSingletonScope();
    bind(HttpOpenHandler).toSelf().inSingletonScope();
    bind(OpenHandler).toService(HttpOpenHandler);

    bind(CommandOpenHandler).toSelf().inSingletonScope();
    bind(OpenHandler).toService(CommandOpenHandler);

    bindContributionProvider(bind, ApplicationShellLayoutMigration);
    bind<ApplicationShellLayoutMigration>(ApplicationShellLayoutMigration).toConstantValue({
        layoutVersion: 2.0,
        onWillInflateLayout({ layoutVersion }): void {
            throw ApplicationShellLayoutMigrationError.create(
                `It is not possible to migrate layout of version ${layoutVersion} to version ${this.layoutVersion}.`
            );
        }
    });

    bindContributionProvider(bind, WidgetFactory);
    bind(WidgetManager).toSelf().inSingletonScope();
    bind(ShellLayoutRestorer).toSelf().inSingletonScope();
    bind(CommandContribution).toService(ShellLayoutRestorer);

    bindResourceProvider(bind);
    bind(InMemoryResources).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(InMemoryResources);

    bind(SelectionService).toSelf().inSingletonScope();
    bind(CommandRegistry).toSelf().inSingletonScope().onActivation(({ container }, registry) => {
        WebSocketConnectionProvider.createProxy(container, commandServicePath, registry);
        return registry;
    });
    bind(CommandService).toService(CommandRegistry);
    bindContributionProvider(bind, CommandContribution);
    bind(QuickOpenContribution).to(CommandQuickOpenContribution);

    bind(ContextKeyService).toSelf().inSingletonScope();

    bind(MenuModelRegistry).toSelf().inSingletonScope();
    bindContributionProvider(bind, MenuContribution);

    bind(KeyboardLayoutService).toSelf().inSingletonScope();
    bind(KeybindingRegistry).toSelf().inSingletonScope();
    bindContributionProvider(bind, KeybindingContext);
    bindContributionProvider(bind, KeybindingContribution);

    bindMessageService(bind).onActivation(({ container }, messages) => {
        const client = container.get(MessageClient);
        WebSocketConnectionProvider.createProxy(container, messageServicePath, client);
        return messages;
    });

    bind(ResourceContextKey).toSelf().inSingletonScope();
    bind(CommonFrontendContribution).toSelf().inSingletonScope();
    [FrontendApplicationContribution, CommandContribution, KeybindingContribution, MenuContribution, ColorContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(CommonFrontendContribution)
    );

    bind(QuickOpenService).toSelf().inSingletonScope();
    bind(QuickInputService).toSelf().inSingletonScope();
    bind(QuickTitleBar).toSelf().inSingletonScope();
    bind(QuickCommandService).toSelf().inSingletonScope();
    bind(QuickCommandFrontendContribution).toSelf().inSingletonScope();
    [CommandContribution, KeybindingContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(QuickCommandFrontendContribution)
    );

    bind(QuickPickService).to(QuickPickServiceImpl).inSingletonScope().onActivation(({ container }, quickPickService: QuickPickService) => {
        WebSocketConnectionProvider.createProxy(container, quickPickServicePath, quickPickService);
        return quickPickService;
    });

    bind(PrefixQuickOpenService).toSelf().inSingletonScope();
    bindContributionProvider(bind, QuickOpenContribution);
    bind(QuickOpenHandlerRegistry).toSelf().inSingletonScope();
    bind(QuickOpenFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(QuickOpenFrontendContribution);

    bind(HelpQuickOpenHandler).toSelf().inSingletonScope();
    bind(QuickOpenContribution).toService(HelpQuickOpenHandler);

    bind(LocalStorageService).toSelf().inSingletonScope();
    bind(StorageService).toService(LocalStorageService);

    bind(StatusBarImpl).toSelf().inSingletonScope();
    bind(StatusBar).toService(StatusBarImpl);
    bind(LabelParser).toSelf().inSingletonScope();

    bindContributionProvider(bind, LabelProviderContribution);
    bind(LabelProvider).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(LabelProvider);
    bind(LabelProviderContribution).to(DefaultUriLabelProviderContribution).inSingletonScope();
    bind(LabelProviderContribution).to(DiffUriLabelProviderContribution).inSingletonScope();

    bind(TreeLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(TreeLabelProvider);

    bindPreferenceService(bind);
    bind(FrontendApplicationContribution).toService(PreferenceService);

    bind(JsonSchemaStore).toSelf().inSingletonScope();

    bind(PingService).toDynamicValue(ctx => {
        // let's reuse a simple and cheap service from this package
        const envServer: EnvVariablesServer = ctx.container.get(EnvVariablesServer);
        return {
            ping(): Promise<EnvVariable | undefined> {
                return envServer.getValue('does_not_matter');
            }
        };
    });
    bind(FrontendConnectionStatusService).toSelf().inSingletonScope();
    bind(ConnectionStatusService).toService(FrontendConnectionStatusService);
    bind(FrontendApplicationContribution).toService(FrontendConnectionStatusService);
    bind(ApplicationConnectionStatusContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ApplicationConnectionStatusContribution);

    bind(ApplicationServer).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<ApplicationServer>(applicationPath);
    }).inSingletonScope();

    bind(AboutDialog).toSelf().inSingletonScope();
    bind(AboutDialogProps).toConstantValue({ title: 'Theia' });

    bind(EnvVariablesServer).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<EnvVariablesServer>(envVariablesPath);
    }).inSingletonScope();

    bind(ThemeService).toDynamicValue(() => ThemeService.get());

    bindCorePreferences(bind);

    bind(MimeService).toSelf().inSingletonScope();

    bind(ApplicationShellMouseTracker).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ApplicationShellMouseTracker);

    bind(ViewContainer.Factory).toFactory(context => (options: ViewContainerIdentifier) => {
        const container = context.container.createChild();
        container.bind(ViewContainerIdentifier).toConstantValue(options);
        container.bind(ViewContainer).toSelf().inSingletonScope();
        return container.get(ViewContainer);
    });

    bind(QuickViewService).toSelf().inSingletonScope();
    bind(QuickOpenContribution).toService(QuickViewService);

    bind(DialogOverlayService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(DialogOverlayService);

    bind(DispatchingProgressClient).toSelf().inSingletonScope();
    bind(ProgressLocationService).toSelf().inSingletonScope();
    bind(ProgressStatusBarItem).toSelf().inSingletonScope();
    bind(ProgressClient).toService(DispatchingProgressClient);
    bind(ProgressService).toSelf().inSingletonScope();
    bind(ProgressBarFactory).toFactory(context => (options: ProgressBarOptions) => {
        const childContainer = context.container.createChild();
        childContainer.bind(ProgressBarOptions).toConstantValue(options);
        childContainer.bind(ProgressBar).toSelf().inSingletonScope();
        return childContainer.get(ProgressBar);
    });

    bind(ContextMenuContext).toSelf().inSingletonScope();
});
