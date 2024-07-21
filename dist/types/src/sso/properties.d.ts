import { Type, InternalWidgetConfigurationProps, WidgetConfigurationProps } from "./widget_configuration";
export declare type Props<CustomWidgetConfigurationProps> = SsoUrlProps & InternalWidgetConfigurationProps & CustomWidgetConfigurationProps;
export declare type ApiRequestOptions = {
    url: RequestInfo;
    options: RequestInit;
};
export declare type ApiResponseBody = {
    widget_url: {
        type: Type;
        url: string;
    };
};
export declare type SsoUrlProps = SsoUrlMethodProps & SsoUrlRequestProps;
export declare type SsoUrlMethodProps = SsoUrlMethodUrlProps | SsoUrlMethodPlatformApiProps | SsoUrlMethodProxyServerProps;
export declare type SsoUrlMethodUrlProps = {
    url: string;
};
export declare type SsoUrlMethodPlatformApiProps = {
    apiKey: string;
    clientId: string;
    environment: string;
    userGuid: string;
};
export declare type SsoUrlMethodProxyServerProps = {
    proxy: string;
};
export declare type SsoUrlRequestProps = {
    onSsoUrlLoadError?: (error: Error) => void;
    ssoRequestBuilder?: (props: WidgetConfigurationProps & InternalWidgetConfigurationProps) => ApiRequestOptions;
    ssoRequestPreprocess?: (opts: ApiRequestOptions) => ApiRequestOptions;
    ssoRequestPostprocess?: (res: ApiResponseBody) => string;
};
export declare function isSsoUrlMethodUrl(props: SsoUrlProps): props is SsoUrlMethodUrlProps;
export declare function isSsoUrlMethodProxyServer(props: SsoUrlProps): props is SsoUrlMethodProxyServerProps;
export declare function isSsoUrlMethodPlatformApi(props: SsoUrlProps): props is SsoUrlMethodPlatformApiProps;
