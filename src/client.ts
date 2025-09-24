import type { BetterAuthClientPlugin } from "better-auth";
import { affiliatePlugin } from "./affiliate";


export const affiliateClientPlugin = () => {

    return {
        id: "affiliate",
        $InferServerPlugin: {} as ReturnType<typeof affiliatePlugin>,
        pathMethods: {
            "/affiliate/generate-link": "POST",
            "/affiliate/issue-cookie": "POST",
        }
    } satisfies BetterAuthClientPlugin
}