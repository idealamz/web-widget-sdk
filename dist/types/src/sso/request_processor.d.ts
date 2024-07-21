import { ApiRequestOptions, ApiResponseBody, Props } from "./properties";
export declare function defaultSsoRequestPostprocess(body: ApiResponseBody): string;
export declare function defaultSsoRequestBuilder<Configuration>(props: Props<Configuration>): ApiRequestOptions;
export declare function defaultSsoRequestPreprocess(opts: ApiRequestOptions): ApiRequestOptions;
