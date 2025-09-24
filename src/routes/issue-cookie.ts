import { createAuthEndpoint } from "better-auth/api";
import * as zod from "zod";
import { AFFILIATE_COOKIE_NAME } from "../affiliate";

export function issueCookieRoute() {
  return createAuthEndpoint(
    "/affiliate/issue-cookie",
    {
      method: "POST",
      body: zod.object({
        code: zod.string(),
      }),
      metadata: {
        openapi: {
          summary: "Issue affiliate cookie",
          description:
            "Sets an 'affiliate' cookie containing the provided referral code.",
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        description: "Status message",
                      },
                    },
                    required: ["message"],
                  },
                },
              },
            },
          },
        },
      },
    },
    async (ctx) => {
      const { code } = ctx.body;

      ctx.setCookie(AFFILIATE_COOKIE_NAME, code, {
        maxAge: 60 * 1000 * 60 * 24 * 30 * 24,
      });
      return { message: "Cookie issued successfully" };
    },
  );
}
