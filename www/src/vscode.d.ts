export {}
declare global {
    const acquireVsCodeApi: ()=> { postMessage(message: any): void; }
}
