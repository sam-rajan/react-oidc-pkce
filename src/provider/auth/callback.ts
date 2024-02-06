export const callBackInvoker = (authCallback: (result: string) => void, status: string) => {
    setTimeout(async () => {
        if (authCallback !== undefined) {
            authCallback(status)
        }
    }, 0);
}