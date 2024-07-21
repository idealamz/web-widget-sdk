export declare enum Environment {
    SAND = "sand",
    QA = "qa",
    INT = "integration",
    PROD = "production"
}
export declare function lookupEnvironment(str: string): Environment;
export declare function lookupHost(str: string): string;
