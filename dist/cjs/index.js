'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isSsoUrlMethodUrl(props) {
    return "url" in props && typeof props.url === "string";
}
function isSsoUrlMethodProxyServer(props) {
    return "proxy" in props && typeof props.proxy === "string";
}
function isSsoUrlMethodPlatformApi(props) {
    return ("clientId" in props &&
        typeof props.clientId === "string" &&
        "apiKey" in props &&
        typeof props.apiKey === "string" &&
        "userGuid" in props &&
        typeof props.userGuid === "string" &&
        "environment" in props &&
        typeof props.environment === "string");
}

const invalidSsoUrlPropsMessage = `Missing required widget props!

Component needs one of the following groups of props:

  - url

    - or -

  - proxy

    - or -

  - apiKey
  - clientId
  - environment
  - userGuid`;
class InvalidSsoUrlPropsError extends Error {
    constructor() {
        super(invalidSsoUrlPropsMessage);
        Object.setPrototypeOf(this, InvalidSsoUrlPropsError.prototype);
    }
}
class RequestError extends Error {
    constructor(statusCode) {
        super(`Request failed: ${statusCode}`);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, RequestError.prototype);
    }
}

var Environment;
(function (Environment) {
    Environment["SAND"] = "sand";
    Environment["QA"] = "qa";
    Environment["INT"] = "integration";
    Environment["PROD"] = "production";
})(Environment || (Environment = {}));
const environmentToEnvironment = {
    [Environment.SAND]: Environment.SAND,
    [Environment.QA]: Environment.QA,
    [Environment.INT]: Environment.INT,
    [Environment.PROD]: Environment.PROD,
};
function lookupEnvironment(str) {
    const env = environmentToEnvironment[str];
    if (!env) {
        throw new Error(`Invalid MX environment: ${str}`);
    }
    return env;
}
const environmentToHost = {
    [Environment.SAND]: "https://api.sand.internal.mx",
    [Environment.QA]: "https://api.qa.internal.mx",
    [Environment.INT]: "https://int-api.mx.com",
    [Environment.PROD]: "https://api.mx.com",
};
function lookupHost(str) {
    const env = lookupEnvironment(str);
    const host = environmentToHost[env];
    if (!host) {
        throw new Error(`Missing host for MX environment: ${str}`);
    }
    return host;
}

var Type$1;
(function (Type) {
    Type["AccountsWidget"] = "accounts_widget";
    Type["BudgetsWidget"] = "budgets_widget";
    Type["ConnectWidget"] = "connect_widget";
    Type["ConnectionsWidget"] = "connections_widget";
    Type["DebtsWidget"] = "debts_widget";
    Type["FinstrongWidget"] = "finstrong_widget";
    Type["GoalsWidget"] = "goals_widget";
    Type["HelpWidget"] = "help_widget";
    Type["MasterWidget"] = "master_widget";
    Type["MiniBudgetsWidget"] = "mini_budgets_widget";
    Type["MiniFinstrongWidget"] = "mini_finstrong_widget";
    Type["MiniPulseCarouselWidget"] = "mini_pulse_carousel_widget";
    Type["MiniSpendingWidget"] = "mini_spending_widget";
    Type["PulseWidget"] = "pulse_widget";
    Type["SettingsWidget"] = "settings_widget";
    Type["SpendingWidget"] = "spending_widget";
    Type["TransactionsWidget"] = "transactions_widget";
    Type["TrendsWidget"] = "trends_widget";
})(Type$1 || (Type$1 = {}));
function getWidgetConfigurationFromProps(props) {
    return {
        client_redirect_url: props.clientRedirectUrl,
        color_scheme: props.colorScheme,
        current_institution_code: props.currentInstitutionCode,
        current_institution_guid: props.currentInstitutionGuid,
        current_member_guid: props.currentMemberGuid,
        disable_institution_search: props.disableInstitutionSearch,
        include_transactions: props.includeTransactions,
        is_mobile_webview: props.isMobileWebview || false,
        mode: props.mode,
        oauth_referral_source: props.oauthReferralSource,
        ui_message_version: props.uiMessageVersion || 4,
        ui_message_webview_url_scheme: props.uiMessageWebviewUrlScheme,
        update_credentials: props.updateCredentials,
        widget_type: props.widgetType,
    };
}

function defaultSsoRequestPostprocess(body) {
    return body.widget_url.url;
}
function defaultSsoRequestBuilder(props) {
    const url = getRequestUrl(props);
    const options = getRequestOptions(props);
    return { url, options };
}
function defaultSsoRequestPreprocess(opts) {
    return opts;
}
function getRequestUrl(props) {
    if (isSsoUrlMethodProxyServer(props)) {
        return getProxyServerRequestUrl(props);
    }
    else if (isSsoUrlMethodPlatformApi(props)) {
        return getPlatformApiRequestUrl(props);
    }
    throw new InvalidSsoUrlPropsError();
}
function getProxyServerRequestUrl(props) {
    return props.proxy;
}
function getPlatformApiRequestUrl(props) {
    const host = lookupHost(props.environment);
    const userGuid = props.userGuid;
    return `${host}/users/${userGuid}/widget_urls`;
}
function getRequestOptions(props) {
    const headers = {
        Accept: "application/vnd.mx.api.v1+json",
        "Content-Type": "application/json",
    };
    if (props.language) {
        headers["Accept-Language"] = props.language;
    }
    if (isSsoUrlMethodPlatformApi(props)) {
        const { apiKey, clientId } = props;
        const authorization = btoa(`${clientId}:${apiKey}`);
        headers["Authorization"] = `Basic ${authorization}`;
    }
    const mode = "cors";
    const method = "POST";
    const body = JSON.stringify({
        widget_url: getWidgetConfigurationFromProps(props),
    });
    return { method, headers, body, mode };
}

function getSsoUrl(props) {
    if (isSsoUrlMethodUrl(props)) {
        return Promise.resolve(props.url);
    }
    const ssoRequestBuilder = props.ssoRequestBuilder || defaultSsoRequestBuilder;
    const ssoRequestPreprocess = props.ssoRequestPreprocess || defaultSsoRequestPreprocess;
    const ssoRequestPostprocess = props.ssoRequestPostprocess || defaultSsoRequestPostprocess;
    const onSsoUrlLoadError = props.onSsoUrlLoadError || defaultOnSsoUrlLoadError;
    const req = ssoRequestPreprocess(ssoRequestBuilder(props));
    return fetch(req.url, req.options)
        .then(handleFetchResponse)
        .then(ssoRequestPostprocess)
        .catch(onSsoUrlLoadError);
}
function handleFetchResponse(res) {
    if (!res.ok) {
        throw new RequestError(res.status);
    }
    return res.json();
}
function defaultOnSsoUrlLoadError(err) {
    console.error(err);
}

const sdkVersion = "0.0.13";

// This is an internal error. Thrown when we are decoding a post message's
// metadata and we encountered a missing field or an invalid value. This
// likely means there has been a change to the definition of a post message
// that we do not know about.
class PostMessageFieldDecodeError extends Error {
    messageType;
    field;
    expectedType;
    gotValue;
    constructor(messageType, field, expectedType, gotValue) {
        super(`Unable to decode '${field}' from '${messageType}'`);
        this.messageType = messageType;
        this.field = field;
        this.expectedType = expectedType;
        this.gotValue = gotValue;
        Object.setPrototypeOf(this, PostMessageFieldDecodeError.prototype);
    }
}
// This is an internal error. Thrown when we get a post message we don't know
// about. This likely means there is a new post message that this package needs
// to define.
class PostMessageUnknownTypeError extends Error {
    postMessageType;
    constructor(postMessageType) {
        super(`Unknown post message: ${postMessageType}`);
        this.postMessageType = postMessageType;
        Object.setPrototypeOf(this, PostMessageUnknownTypeError.prototype);
    }
}
function assertMessageProp(container, postMessageType, field, expectedType, properties = {}) {
    const value = container[field];
    const valueIsDefined = typeof value !== "undefined";
    const valueIsString = typeof value === "string";
    const valueIsNumber = typeof value === "number";
    const valueIsObject = typeof value === "object" && !Array.isArray(value);
    const valueIsBoolean = typeof value === "boolean";
    const typeIsString = expectedType === "string";
    const typeIsNumber = expectedType === "number";
    const typeIsArray = expectedType instanceof Array;
    const typeIsObject = typeof expectedType === "object" && !Array.isArray(expectedType);
    const typeIsBoolean = expectedType === "boolean";
    if (!valueIsDefined && properties.optional) {
        return;
    }
    else if (!valueIsDefined) {
        throw new PostMessageFieldDecodeError(postMessageType, field, expectedType, value);
    }
    else if (typeIsString && !valueIsString) {
        throw new PostMessageFieldDecodeError(postMessageType, field, expectedType, value);
    }
    else if (typeIsNumber && !valueIsNumber) {
        throw new PostMessageFieldDecodeError(postMessageType, field, expectedType, value);
    }
    else if (typeIsArray && !(valueIsString && expectedType.includes(value))) {
        throw new PostMessageFieldDecodeError(postMessageType, field, expectedType, value);
    }
    else if (typeIsObject && !valueIsObject) {
        throw new PostMessageFieldDecodeError(postMessageType, field, expectedType, value);
    }
    else if (typeIsBoolean && !valueIsBoolean) {
        throw new PostMessageFieldDecodeError(postMessageType, field, expectedType, value);
    }
    else if (typeIsObject && valueIsObject) {
        Object.keys(expectedType).forEach((field) => {
            assertMessageProp(value, postMessageType, field, expectedType[field]);
        });
    }
}

/**
 * This file is auto-generated by widget-post-message-definitions,
 * DO NOT EDIT.
 *
 * If you need to make changes to the code in this file, you can do so by
 * modifying the definitions found in the widget-post-message-definitions
 * project.
 */
var Type;
(function (Type) {
    Type["Load"] = "mx/load";
    Type["Ping"] = "mx/ping";
    Type["Navigation"] = "mx/navigation";
    Type["FocusTrap"] = "mx/focusTrap";
    Type["ClientOAuthComplete"] = "mx/client/oauthComplete";
    Type["ConnectLoaded"] = "mx/connect/loaded";
    Type["ConnectEnterCredentials"] = "mx/connect/enterCredentials";
    Type["ConnectInstitutionSearch"] = "mx/connect/institutionSearch";
    Type["ConnectSelectedInstitution"] = "mx/connect/selectedInstitution";
    Type["ConnectMemberConnected"] = "mx/connect/memberConnected";
    Type["ConnectConnectedPrimaryAction"] = "mx/connect/connected/primaryAction";
    Type["ConnectMemberDeleted"] = "mx/connect/memberDeleted";
    Type["ConnectCreateMemberError"] = "mx/connect/createMemberError";
    Type["ConnectMemberStatusUpdate"] = "mx/connect/memberStatusUpdate";
    Type["ConnectOAuthError"] = "mx/connect/oauthError";
    Type["ConnectOAuthRequested"] = "mx/connect/oauthRequested";
    Type["ConnectStepChange"] = "mx/connect/stepChange";
    Type["ConnectSubmitMFA"] = "mx/connect/submitMFA";
    Type["ConnectUpdateCredentials"] = "mx/connect/updateCredentials";
    Type["ConnectBackToSearch"] = "mx/connect/backToSearch";
    Type["ConnectInvalidData"] = "mx/connect/invalidData";
    Type["PulseOverdraftWarningCtaTransferFunds"] = "mx/pulse/overdraftWarning/cta/transferFunds";
    Type["AccountCreated"] = "mx/account/created";
})(Type || (Type = {}));
const typeLookup = {
    [Type.Load]: Type.Load,
    [Type.Ping]: Type.Ping,
    [Type.Navigation]: Type.Navigation,
    [Type.FocusTrap]: Type.FocusTrap,
    "mx/focustrap": Type.FocusTrap,
    [Type.ClientOAuthComplete]: Type.ClientOAuthComplete,
    "mx/client/oauthcomplete": Type.ClientOAuthComplete,
    [Type.ConnectLoaded]: Type.ConnectLoaded,
    [Type.ConnectEnterCredentials]: Type.ConnectEnterCredentials,
    "mx/connect/entercredentials": Type.ConnectEnterCredentials,
    [Type.ConnectInstitutionSearch]: Type.ConnectInstitutionSearch,
    "mx/connect/institutionsearch": Type.ConnectInstitutionSearch,
    [Type.ConnectSelectedInstitution]: Type.ConnectSelectedInstitution,
    "mx/connect/selectedinstitution": Type.ConnectSelectedInstitution,
    [Type.ConnectMemberConnected]: Type.ConnectMemberConnected,
    "mx/connect/memberconnected": Type.ConnectMemberConnected,
    [Type.ConnectConnectedPrimaryAction]: Type.ConnectConnectedPrimaryAction,
    "mx/connect/connected/primaryaction": Type.ConnectConnectedPrimaryAction,
    [Type.ConnectMemberDeleted]: Type.ConnectMemberDeleted,
    "mx/connect/memberdeleted": Type.ConnectMemberDeleted,
    [Type.ConnectCreateMemberError]: Type.ConnectCreateMemberError,
    "mx/connect/createmembererror": Type.ConnectCreateMemberError,
    [Type.ConnectMemberStatusUpdate]: Type.ConnectMemberStatusUpdate,
    "mx/connect/memberstatusupdate": Type.ConnectMemberStatusUpdate,
    [Type.ConnectOAuthError]: Type.ConnectOAuthError,
    "mx/connect/oautherror": Type.ConnectOAuthError,
    [Type.ConnectOAuthRequested]: Type.ConnectOAuthRequested,
    "mx/connect/oauthrequested": Type.ConnectOAuthRequested,
    [Type.ConnectStepChange]: Type.ConnectStepChange,
    "mx/connect/stepchange": Type.ConnectStepChange,
    [Type.ConnectSubmitMFA]: Type.ConnectSubmitMFA,
    "mx/connect/submitmfa": Type.ConnectSubmitMFA,
    [Type.ConnectUpdateCredentials]: Type.ConnectUpdateCredentials,
    "mx/connect/updatecredentials": Type.ConnectUpdateCredentials,
    [Type.ConnectBackToSearch]: Type.ConnectBackToSearch,
    "mx/connect/backtosearch": Type.ConnectBackToSearch,
    [Type.ConnectInvalidData]: Type.ConnectInvalidData,
    "mx/connect/invaliddata": Type.ConnectInvalidData,
    [Type.PulseOverdraftWarningCtaTransferFunds]: Type.PulseOverdraftWarningCtaTransferFunds,
    "mx/pulse/overdraftwarning/cta/transferfunds": Type.PulseOverdraftWarningCtaTransferFunds,
    [Type.AccountCreated]: Type.AccountCreated,
};
/**
 * Given a post message type (eg, "mx/load", "mx/connect/memberConnected") and
 * the payload for that message, this function parses the payload object and
 * returns a validated and typed object.
 *
 * @throws {PostMessageUnknownTypeError}
 * @throws {PostMessageFieldDecodeError}
 */
function buildPayload(type, metadata) {
    switch (type) {
        case Type.Load:
            return {
                type,
            };
        case Type.Ping:
            assertMessageProp(metadata, "mx/ping", "user_guid", "string");
            assertMessageProp(metadata, "mx/ping", "session_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
            };
        case Type.Navigation:
            assertMessageProp(metadata, "mx/navigation", "user_guid", "string");
            assertMessageProp(metadata, "mx/navigation", "session_guid", "string");
            assertMessageProp(metadata, "mx/navigation", "did_go_back", "boolean");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                did_go_back: metadata.did_go_back,
            };
        case Type.FocusTrap:
            assertMessageProp(metadata, "mx/focusTrap", "user_guid", "string");
            assertMessageProp(metadata, "mx/focusTrap", "session_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
            };
        case Type.ClientOAuthComplete:
            assertMessageProp(metadata, "mx/client/oauthComplete", "url", "string");
            return {
                type,
                url: metadata.url,
            };
        case Type.ConnectLoaded:
            assertMessageProp(metadata, "mx/connect/loaded", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/loaded", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/loaded", "initial_step", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                initial_step: metadata.initial_step,
            };
        case Type.ConnectEnterCredentials:
            assertMessageProp(metadata, "mx/connect/enterCredentials", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/enterCredentials", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/enterCredentials", "institution", { code: "string", guid: "string" });
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                institution: metadata.institution,
            };
        case Type.ConnectInstitutionSearch:
            assertMessageProp(metadata, "mx/connect/institutionSearch", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/institutionSearch", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/institutionSearch", "query", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                query: metadata.query,
            };
        case Type.ConnectSelectedInstitution:
            assertMessageProp(metadata, "mx/connect/selectedInstitution", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/selectedInstitution", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/selectedInstitution", "code", "string");
            assertMessageProp(metadata, "mx/connect/selectedInstitution", "guid", "string");
            assertMessageProp(metadata, "mx/connect/selectedInstitution", "name", "string");
            assertMessageProp(metadata, "mx/connect/selectedInstitution", "url", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                code: metadata.code,
                guid: metadata.guid,
                name: metadata.name,
                url: metadata.url,
            };
        case Type.ConnectMemberConnected:
            assertMessageProp(metadata, "mx/connect/memberConnected", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberConnected", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberConnected", "member_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
            };
        case Type.ConnectConnectedPrimaryAction:
            assertMessageProp(metadata, "mx/connect/connected/primaryAction", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/connected/primaryAction", "session_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
            };
        case Type.ConnectMemberDeleted:
            assertMessageProp(metadata, "mx/connect/memberDeleted", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberDeleted", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberDeleted", "member_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
            };
        case Type.ConnectCreateMemberError:
            assertMessageProp(metadata, "mx/connect/createMemberError", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/createMemberError", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/createMemberError", "institution_guid", "string");
            assertMessageProp(metadata, "mx/connect/createMemberError", "institution_code", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                institution_guid: metadata.institution_guid,
                institution_code: metadata.institution_code,
            };
        case Type.ConnectMemberStatusUpdate:
            assertMessageProp(metadata, "mx/connect/memberStatusUpdate", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberStatusUpdate", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberStatusUpdate", "member_guid", "string");
            assertMessageProp(metadata, "mx/connect/memberStatusUpdate", "connection_status", "number");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
                connection_status: metadata.connection_status,
            };
        case Type.ConnectOAuthError:
            assertMessageProp(metadata, "mx/connect/oauthError", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/oauthError", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/oauthError", "member_guid", "string", {
                optional: true,
            });
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
            };
        case Type.ConnectOAuthRequested:
            assertMessageProp(metadata, "mx/connect/oauthRequested", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/oauthRequested", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/oauthRequested", "url", "string");
            assertMessageProp(metadata, "mx/connect/oauthRequested", "member_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                url: metadata.url,
                member_guid: metadata.member_guid,
            };
        case Type.ConnectStepChange:
            assertMessageProp(metadata, "mx/connect/stepChange", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/stepChange", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/stepChange", "previous", "string");
            assertMessageProp(metadata, "mx/connect/stepChange", "current", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                previous: metadata.previous,
                current: metadata.current,
            };
        case Type.ConnectSubmitMFA:
            assertMessageProp(metadata, "mx/connect/submitMFA", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/submitMFA", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/submitMFA", "member_guid", "string");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
            };
        case Type.ConnectUpdateCredentials:
            assertMessageProp(metadata, "mx/connect/updateCredentials", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/updateCredentials", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/updateCredentials", "member_guid", "string");
            assertMessageProp(metadata, "mx/connect/updateCredentials", "institution", { code: "string", guid: "string" });
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
                institution: metadata.institution,
            };
        case Type.ConnectBackToSearch:
            assertMessageProp(metadata, "mx/connect/backToSearch", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/backToSearch", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/backToSearch", "context", "string", {
                optional: true,
            });
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                context: metadata.context,
            };
        case Type.ConnectInvalidData:
            assertMessageProp(metadata, "mx/connect/invalidData", "user_guid", "string");
            assertMessageProp(metadata, "mx/connect/invalidData", "session_guid", "string");
            assertMessageProp(metadata, "mx/connect/invalidData", "member_guid", "string");
            assertMessageProp(metadata, "mx/connect/invalidData", "code", "number");
            return {
                type,
                user_guid: metadata.user_guid,
                session_guid: metadata.session_guid,
                member_guid: metadata.member_guid,
                code: metadata.code,
            };
        case Type.PulseOverdraftWarningCtaTransferFunds:
            assertMessageProp(metadata, "mx/pulse/overdraftWarning/cta/transferFunds", "account_guid", "string");
            assertMessageProp(metadata, "mx/pulse/overdraftWarning/cta/transferFunds", "amount", "number");
            return {
                type,
                account_guid: metadata.account_guid,
                amount: metadata.amount,
            };
        case Type.AccountCreated:
            assertMessageProp(metadata, "mx/account/created", "guid", "string");
            return {
                type,
                guid: metadata.guid,
            };
        default:
            throw new PostMessageUnknownTypeError(type);
    }
}
/**
 * @see {buildPayload}
 */
function buildPayloadFromPostMessageEventData(data) {
    const rawType = data.type || "type not provided";
    let type;
    if (rawType && rawType in typeLookup) {
        type = typeLookup[rawType];
    }
    else {
        throw new PostMessageUnknownTypeError(rawType);
    }
    const metadata = data.metadata || {};
    const payload = buildPayload(type, metadata);
    return payload;
}
/**
 * Called if we encounter an error while parsing or dispatching a post message
 * event. Internal errors are dispatched to the appropriate error callback, and
 * everything else is thrown so it can be handled in the host application since
 * it's likely an application/user-level error.
 */
function dispatchError(message, error, callbacks) {
    if (error instanceof PostMessageFieldDecodeError) {
        callbacks.onInvalidMessageError?.(message, error);
    }
    else if (error instanceof PostMessageUnknownTypeError) {
        callbacks.onInvalidMessageError?.(message, error);
    }
    else {
        throw error;
    }
}
/**
 * We dispatch all messages to the onMessage callback.
 */
function dispatchOnMessage(message, callbacks) {
    callbacks.onMessage?.(message);
}
/**
 * Dispatch a post message event that we got from a message event for any
 * widget. Does not handle widget specific post messages. See other dispatch
 * methods for widget specific dispatching.
 */
function dispatchWidgetPostMessageEvent(event, callbacks) {
    let payload;
    try {
        dispatchOnMessage(event, callbacks);
        payload = buildPayloadFromPostMessageEventData(event.data);
        dispatchWidgetInternalMessage(payload, callbacks);
    }
    catch (error) {
        dispatchError(event, error, callbacks);
    }
    return payload;
}
/**
 * Dispatch a validated internal message for any widget.
 */
function dispatchWidgetInternalMessage(payload, callbacks) {
    switch (payload.type) {
        case Type.Load:
            callbacks.onLoad?.(payload);
            break;
        case Type.Ping:
            callbacks.onPing?.(payload);
            break;
        case Type.Navigation:
            callbacks.onNavigation?.(payload);
            break;
        case Type.FocusTrap:
            callbacks.onFocusTrap?.(payload);
            break;
        case Type.AccountCreated:
            callbacks.onAccountCreated?.(payload);
            break;
        default:
            throw new PostMessageUnknownTypeError(payload.type);
    }
}
/**
 * Dispatch a post message event that we got from a window/document message for the
 * Connect Widget.
 */
function dispatchConnectPostMessageEvent(event, callbacks) {
    let payload;
    try {
        dispatchOnMessage(event, callbacks);
        payload = buildPayloadFromPostMessageEventData(event.data);
        dispatchConnectInternalMessage(payload, callbacks);
    }
    catch (error) {
        dispatchError(event, error, callbacks);
    }
    return payload;
}
/**
 * Dispatch a validated internal message for the Connect Widget.
 */
function dispatchConnectInternalMessage(payload, callbacks) {
    switch (payload.type) {
        case Type.Load:
            callbacks.onLoad?.(payload);
            break;
        case Type.Ping:
            callbacks.onPing?.(payload);
            break;
        case Type.Navigation:
            callbacks.onNavigation?.(payload);
            break;
        case Type.FocusTrap:
            callbacks.onFocusTrap?.(payload);
            break;
        case Type.AccountCreated:
            callbacks.onAccountCreated?.(payload);
            break;
        case Type.ConnectLoaded:
            callbacks.onLoaded?.(payload);
            break;
        case Type.ConnectEnterCredentials:
            callbacks.onEnterCredentials?.(payload);
            break;
        case Type.ConnectInstitutionSearch:
            callbacks.onInstitutionSearch?.(payload);
            break;
        case Type.ConnectSelectedInstitution:
            callbacks.onSelectedInstitution?.(payload);
            break;
        case Type.ConnectMemberConnected:
            callbacks.onMemberConnected?.(payload);
            break;
        case Type.ConnectConnectedPrimaryAction:
            callbacks.onConnectedPrimaryAction?.(payload);
            break;
        case Type.ConnectMemberDeleted:
            callbacks.onMemberDeleted?.(payload);
            break;
        case Type.ConnectCreateMemberError:
            callbacks.onCreateMemberError?.(payload);
            break;
        case Type.ConnectMemberStatusUpdate:
            callbacks.onMemberStatusUpdate?.(payload);
            break;
        case Type.ConnectOAuthError:
            callbacks.onOAuthError?.(payload);
            break;
        case Type.ConnectOAuthRequested:
            callbacks.onOAuthRequested?.(payload);
            break;
        case Type.ConnectStepChange:
            callbacks.onStepChange?.(payload);
            break;
        case Type.ConnectSubmitMFA:
            callbacks.onSubmitMFA?.(payload);
            break;
        case Type.ConnectUpdateCredentials:
            callbacks.onUpdateCredentials?.(payload);
            break;
        case Type.ConnectBackToSearch:
            callbacks.onBackToSearch?.(payload);
            break;
        case Type.ConnectInvalidData:
            callbacks.onInvalidData?.(payload);
            break;
        default:
            throw new PostMessageUnknownTypeError(payload.type);
    }
}
/**
 * Dispatch a post message event that we got from a window/document message for the
 * Pulse Widget.
 */
function dispatchPulsePostMessageEvent(event, callbacks) {
    let payload;
    try {
        dispatchOnMessage(event, callbacks);
        payload = buildPayloadFromPostMessageEventData(event.data);
        dispatchPulseInternalMessage(payload, callbacks);
    }
    catch (error) {
        dispatchError(event, error, callbacks);
    }
    return payload;
}
/**
 * Dispatch a validated internal message for the Pulse Widget.
 */
function dispatchPulseInternalMessage(payload, callbacks) {
    switch (payload.type) {
        case Type.Load:
            callbacks.onLoad?.(payload);
            break;
        case Type.Ping:
            callbacks.onPing?.(payload);
            break;
        case Type.Navigation:
            callbacks.onNavigation?.(payload);
            break;
        case Type.FocusTrap:
            callbacks.onFocusTrap?.(payload);
            break;
        case Type.AccountCreated:
            callbacks.onAccountCreated?.(payload);
            break;
        case Type.PulseOverdraftWarningCtaTransferFunds:
            callbacks.onOverdraftWarningCtaTransferFunds?.(payload);
            break;
        default:
            throw new PostMessageUnknownTypeError(payload.type);
    }
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Widget {
    constructor(options) {
        this.isUnmounting = false;
        this.options = options;
        this.iframe = document.createElement("iframe");
        this.style = options.style || {
            border: "none",
            height: "550px",
            width: "320px",
        };
        this.messageCallback = (event) => {
            this.handleMXPostMessage(event);
        };
        if (typeof options.container === "string") {
            const container = document.querySelector(options.container);
            if (!container) {
                throw new Error(`Unable to find widget container. Ensure that an element matching a selector for '${this.options.container}' is available in the DOM before you initialize the widget.`);
            }
            this.container = container;
        }
        else if (options.container instanceof Element) {
            this.container = options.container;
        }
        else {
            throw new Error("Invalid or missing value for container property, expecting a query selector string or a DOM Element.");
        }
        this.setupIframe();
        this.setupListener();
    }
    get widgetType() {
        if (this.options.widgetType) {
            return this.options.widgetType;
        }
        throw new Error("Missing value for widgetType property, expecting a string (eg. connect_widget).");
    }
    get dispatcher() {
        return dispatchWidgetPostMessageEvent;
    }
    navigateBack() {
        return new Promise((resolve) => {
            const iframeElement = this.iframe.contentWindow;
            const data = { mx: true, type: Type.Navigation, payload: { action: "back" } };
            if (!iframeElement) {
                throw new Error("Unable to navigate back, iframe element is not available.");
            }
            const handleIncomingNavigationEvent = (e) => {
                if (e.data.type === Type.Navigation) {
                    window.removeEventListener("message", handleIncomingNavigationEvent);
                    resolve(e.data.metadata.did_go_back);
                }
            };
            window.addEventListener("message", handleIncomingNavigationEvent, false);
            iframeElement.postMessage(JSON.stringify(data), this.targetOrigin);
        });
    }
    ping() {
        this.postMessageToWidget({ type: "ping" });
    }
    unmount() {
        this.isUnmounting = true;
        this.teardownListener();
        this.teardownIframe();
    }
    get targetOrigin() {
        var _a;
        const baseUrlPattern = /^https?:\/\/[^/]+/i;
        let targetOrigin;
        if (this.ssoUrl && this.ssoUrl.match(baseUrlPattern)) {
            targetOrigin = (_a = this.ssoUrl.match(baseUrlPattern)) === null || _a === void 0 ? void 0 : _a[0];
        }
        return targetOrigin || "https://widgets.moneydesktop.com";
    }
    waitForIframe(maxWaitTime = 500, checkInterval = 100) {
        return new Promise((resolve, reject) => {
            let elapsed = 0;
            const checkIframe = () => {
                if (this.iframe.contentWindow) {
                    resolve();
                }
                else if (elapsed > maxWaitTime) {
                    reject(new Error("iframe.contentWindow is not ready within the specified time"));
                }
                else {
                    elapsed += checkInterval;
                    setTimeout(checkIframe, checkInterval);
                }
            };
            checkIframe();
        });
    }
    handleMXPostMessage(event) {
        if (!event.data.mx) {
            return;
        }
        this.dispatcher(event, this.options);
        if (event.data.type === Type.Load) {
            this.postMessageToWidget({
                type: "mx/sdk/info",
                metadata: {
                    sdk: "web",
                    version: sdkVersion,
                },
            });
        }
    }
    postMessageToWidget(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.waitForIframe(5000, 50);
                debugger;
                this.iframe.contentWindow.postMessage(JSON.stringify(payload), this.targetOrigin);
            }
            catch (error) {
                debugger;
                throw new Error("Unable to postMessage to widget, iframe doesn't exist");
            }
        });
    }
    setupIframe() {
        getSsoUrl(Object.assign(Object.assign({}, this.options), { widgetType: this.widgetType })).then((url) => {
            if (this.isUnmounting || !url) {
                return;
            }
            this.ssoUrl = url;
            this.iframe.setAttribute("data-test-id", "mx-widget-iframe");
            this.iframe.setAttribute("title", this.options.iframeTitle || "Widget Iframe");
            this.iframe.setAttribute("src", url);
            Object.keys(this.style).forEach((prop) => {
                this.iframe.style[prop] = this.style[prop];
            });
            this.container.appendChild(this.iframe);
        });
    }
    teardownIframe() {
        if (this.container.contains(this.iframe)) {
            this.container.removeChild(this.iframe);
        }
    }
    setupListener() {
        window.addEventListener("message", this.messageCallback, false);
    }
    teardownListener() {
        window.removeEventListener("message", this.messageCallback, false);
    }
}
class AccountsWidget extends Widget {
    get widgetType() {
        return Type$1.AccountsWidget;
    }
}
class BudgetsWidget extends Widget {
    get widgetType() {
        return Type$1.BudgetsWidget;
    }
}
class ConnectWidget extends Widget {
    get widgetType() {
        return Type$1.ConnectWidget;
    }
    get dispatcher() {
        return dispatchConnectPostMessageEvent;
    }
}
class ConnectionsWidget extends Widget {
    get widgetType() {
        return Type$1.ConnectionsWidget;
    }
}
class DebtsWidget extends Widget {
    get widgetType() {
        return Type$1.DebtsWidget;
    }
}
class FinstrongWidget extends Widget {
    get widgetType() {
        return Type$1.FinstrongWidget;
    }
}
class GoalsWidget extends Widget {
    get widgetType() {
        return Type$1.GoalsWidget;
    }
}
class HelpWidget extends Widget {
    get widgetType() {
        return Type$1.HelpWidget;
    }
}
class MasterWidget extends Widget {
    get widgetType() {
        return Type$1.MasterWidget;
    }
}
class MiniBudgetsWidget extends Widget {
    get widgetType() {
        return Type$1.MiniBudgetsWidget;
    }
}
class MiniFinstrongWidget extends Widget {
    get widgetType() {
        return Type$1.MiniFinstrongWidget;
    }
}
class MiniPulseCarouselWidget extends Widget {
    get widgetType() {
        return Type$1.MiniPulseCarouselWidget;
    }
    get dispatcher() {
        return dispatchPulsePostMessageEvent;
    }
}
class MiniSpendingWidget extends Widget {
    get widgetType() {
        return Type$1.MiniSpendingWidget;
    }
}
class PulseWidget extends Widget {
    get widgetType() {
        return Type$1.PulseWidget;
    }
    get dispatcher() {
        return dispatchPulsePostMessageEvent;
    }
}
class SettingsWidget extends Widget {
    get widgetType() {
        return Type$1.SettingsWidget;
    }
}
class SpendingWidget extends Widget {
    get widgetType() {
        return Type$1.SpendingWidget;
    }
}
class TransactionsWidget extends Widget {
    get widgetType() {
        return Type$1.TransactionsWidget;
    }
}
class TrendsWidget extends Widget {
    get widgetType() {
        return Type$1.TrendsWidget;
    }
}

exports.AccountsWidget = AccountsWidget;
exports.BudgetsWidget = BudgetsWidget;
exports.ConnectWidget = ConnectWidget;
exports.ConnectionsWidget = ConnectionsWidget;
exports.DebtsWidget = DebtsWidget;
exports.FinstrongWidget = FinstrongWidget;
exports.GoalsWidget = GoalsWidget;
exports.HelpWidget = HelpWidget;
exports.MasterWidget = MasterWidget;
exports.MiniBudgetsWidget = MiniBudgetsWidget;
exports.MiniFinstrongWidget = MiniFinstrongWidget;
exports.MiniPulseCarouselWidget = MiniPulseCarouselWidget;
exports.MiniSpendingWidget = MiniSpendingWidget;
exports.PulseWidget = PulseWidget;
exports.SettingsWidget = SettingsWidget;
exports.SpendingWidget = SpendingWidget;
exports.TransactionsWidget = TransactionsWidget;
exports.TrendsWidget = TrendsWidget;
exports.Widget = Widget;
