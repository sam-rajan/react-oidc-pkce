export type Flow =    { type: "REGISTER"; callback: (result: string) => void | undefined }
                    | { type: "SUCCESS" | "FAILED" | "TOKEN" | "REFRESHER" }
                    | { type: "AUTHORIZE"; isForce: boolean}

export function mockFlowController(state: any, action: Flow) {

    const mutate = {
        config: state.config,
        callback: state.callback
    }
    switch (action.type) {
        case 'REGISTER': {
            return {
                callback: action.callback,
                config: state.config
            };
        }
        case 'TOKEN': {
            mockFetchToken()
            return mutate
        }
        case 'AUTHORIZE': {
            
            return mutate
        }
        case 'REFRESHER': {
            return mutate
        }
    }
}


function mockFetchToken() {
    console.log("success")
}