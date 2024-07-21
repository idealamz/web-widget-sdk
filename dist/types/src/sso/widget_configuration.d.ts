export declare enum Type {
    AccountsWidget = "accounts_widget",
    BudgetsWidget = "budgets_widget",
    ConnectWidget = "connect_widget",
    ConnectionsWidget = "connections_widget",
    DebtsWidget = "debts_widget",
    FinstrongWidget = "finstrong_widget",
    GoalsWidget = "goals_widget",
    HelpWidget = "help_widget",
    MasterWidget = "master_widget",
    MiniBudgetsWidget = "mini_budgets_widget",
    MiniFinstrongWidget = "mini_finstrong_widget",
    MiniPulseCarouselWidget = "mini_pulse_carousel_widget",
    MiniSpendingWidget = "mini_spending_widget",
    PulseWidget = "pulse_widget",
    SettingsWidget = "settings_widget",
    SpendingWidget = "spending_widget",
    TransactionsWidget = "transactions_widget",
    TrendsWidget = "trends_widget"
}
declare type CWM = "verification" | "aggregation";
export declare type ConnectWidgetMode = `${CWM}` | `${CWM},${CWM}` | `${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM}` | `${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM},${CWM}`;
declare type Camelize<T> = {
    [K in keyof T as CamelizeString<K>]: T[K];
};
declare type CamelizeString<T extends PropertyKey, C extends string = ""> = T extends string ? string extends T ? string : T extends `${infer F}_${infer R}` ? CamelizeString<Capitalize<R>, `${C}${F}`> : `${C}${T}` : T;
export declare type InternalWidgetConfigurationProps = Camelize<InternalWidgetConfiguration>;
export declare type InternalWidgetConfiguration = WidgetConfiguration & {
    widget_type?: Type;
};
export declare type WidgetConfigurationProps = Camelize<WidgetConfiguration>;
export declare type WidgetConfiguration = {
    color_scheme?: "dark" | "light";
    is_mobile_webview?: boolean;
    language?: string;
    oauth_referral_source?: string;
    ui_message_version?: number;
    ui_message_webview_url_scheme?: string;
};
export declare type ConnectWidgetConfigurationProps = Camelize<ConnectWidgetConfiguration>;
export declare type ConnectWidgetConfiguration = WidgetConfiguration & {
    client_redirect_url?: string;
    current_institution_code?: string;
    current_institution_guid?: string;
    current_member_guid?: string;
    disable_institution_search?: boolean;
    include_transactions?: boolean;
    mode?: ConnectWidgetMode;
    update_credentials?: boolean;
};
export declare function getWidgetConfigurationFromProps(props: ConnectWidgetConfigurationProps & InternalWidgetConfigurationProps): {
    client_redirect_url: string | undefined;
    color_scheme: "dark" | "light" | undefined;
    current_institution_code: string | undefined;
    current_institution_guid: string | undefined;
    current_member_guid: string | undefined;
    disable_institution_search: boolean | undefined;
    include_transactions: boolean | undefined;
    is_mobile_webview: boolean;
    mode: ConnectWidgetMode | undefined;
    oauth_referral_source: string | undefined;
    ui_message_version: number;
    ui_message_webview_url_scheme: string | undefined;
    update_credentials: boolean | undefined;
    widget_type: Type | undefined;
};
export {};
