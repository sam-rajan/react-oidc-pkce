export const callBackInvoker = (authCallback: ((result: string) => void) | undefined, status: string) => {
    setTimeout(async () => {
        if (authCallback !== undefined) {
            authCallback(status)
        }
    }, 0);
}