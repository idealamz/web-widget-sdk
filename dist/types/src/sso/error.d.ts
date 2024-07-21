export declare class InvalidSsoUrlPropsError extends Error {
    constructor();
}
export declare class RequestError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number);
}
