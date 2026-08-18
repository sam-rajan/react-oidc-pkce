import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

// StrictMode is intentional here: it double-invokes effects/reducers in
// dev, which is exactly what would expose a regression of the "side
// effects inside the reducer" bug this library was fixed for.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
