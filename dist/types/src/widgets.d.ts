import { Props as UrlLoadingProps, Type, ConnectWidgetConfigurationProps } from "./sso";
import { ConnectPostMessageCallbackProps, PulsePostMessageCallbackProps, WidgetPostMessageCallbackProps, dispatchConnectPostMessageEvent, dispatchPulsePostMessageEvent, dispatchWidgetPostMessageEvent } from "@mxenabled/widget-post-message-definitions";
declare type BaseOptions = {
    container: string | Element;
    iframeTitle?: string;
    style?: Partial<CSSStyleDeclaration>;
};
export declare type WidgetOptions<Configuration, CallbackProps> = BaseOptions & UrlLoadingProps<Configuration> & CallbackProps;
export declare abstract class Widget<Configuration = unknown, CallbackProps = WidgetPostMessageCallbackProps<MessageEvent>> {
    protected options: WidgetOptions<unknown, WidgetPostMessageCallbackProps<MessageEvent>>;
    protected iframe: HTMLIFrameElement;
    protected container: Element;
    protected style: Partial<CSSStyleDeclaration>;
    protected isUnmounting: boolean;
    protected ssoUrl?: string;
    protected messageCallback: (event: MessageEvent) => void;
    constructor(options: WidgetOptions<Configuration, CallbackProps>);
    get widgetType(): Type;
    get dispatcher(): typeof dispatchWidgetPostMessageEvent;
    navigateBack(): Promise<boolean>;
    ping(): void;
    unmount(): void;
    get targetOrigin(): string;
    private waitForIframe;
    private handleMXPostMessage;
    private postMessageToWidget;
    private setupIframe;
    private teardownIframe;
    private setupListener;
    private teardownListener;
}
export declare class AccountsWidget extends Widget {
    get widgetType(): Type;
}
export declare class BudgetsWidget extends Widget {
    get widgetType(): Type;
}
export declare class ConnectWidget extends Widget<ConnectWidgetConfigurationProps, ConnectPostMessageCallbackProps<MessageEvent>> {
    get widgetType(): Type;
    get dispatcher(): typeof dispatchConnectPostMessageEvent;
}
export declare class ConnectionsWidget extends Widget {
    get widgetType(): Type;
}
export declare class DebtsWidget extends Widget {
    get widgetType(): Type;
}
export declare class FinstrongWidget extends Widget {
    get widgetType(): Type;
}
export declare class GoalsWidget extends Widget {
    get widgetType(): Type;
}
export declare class HelpWidget extends Widget {
    get widgetType(): Type;
}
export declare class MasterWidget extends Widget {
    get widgetType(): Type;
}
export declare class MiniBudgetsWidget extends Widget {
    get widgetType(): Type;
}
export declare class MiniFinstrongWidget extends Widget {
    get widgetType(): Type;
}
export declare class MiniPulseCarouselWidget extends Widget<unknown, PulsePostMessageCallbackProps<MessageEvent>> {
    get widgetType(): Type;
    get dispatcher(): typeof dispatchPulsePostMessageEvent;
}
export declare class MiniSpendingWidget extends Widget {
    get widgetType(): Type;
}
export declare class PulseWidget extends Widget<unknown, PulsePostMessageCallbackProps<MessageEvent>> {
    get widgetType(): Type;
    get dispatcher(): typeof dispatchPulsePostMessageEvent;
}
export declare class SettingsWidget extends Widget {
    get widgetType(): Type;
}
export declare class SpendingWidget extends Widget {
    get widgetType(): Type;
}
export declare class TransactionsWidget extends Widget {
    get widgetType(): Type;
}
export declare class TrendsWidget extends Widget {
    get widgetType(): Type;
}
export {};
