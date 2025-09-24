import { createEndpoint } from "better-auth";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import * as zod from "zod";
import { AFFILIATE_COOKIE_NAME } from "../affiliate";


export function issueCookieRoute(){

    return createEndpoint('affiliate/issue-cookie',
    {
        method: 'POST',
        body: zod.object({
            code: zod.string(),
        })
    },
    async (ctx) => {
        const { code } = ctx.body;

        ctx.setCookie(AFFILIATE_COOKIE_NAME, code,{
            maxAge: 60 * 1000 * 60 * 24* 30 *24,
        });
        return { message: "Cookie issued successfully" };

    }
    )
}