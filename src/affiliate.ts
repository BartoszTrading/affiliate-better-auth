import crypto from "node:crypto";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { createRoutes } from "./routes";
import { parseSetCookieHeader } from "better-auth/cookies";

const CODE_LENGTH = 6;
export const AFFILIATE_COOKIE_NAME = "affiliate";
const AFFILIATE_CODE_TABLE_NAME = "affiliate_code";
const AFFILIATE_TABLE_NAME = "affiliate";

export function generateRandomCode() {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(CODE_LENGTH);

  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

// generateLinkRoute - generate code for UserId and return it
// generateCookie - takes hashed code and creates cookie linked to it and includes in response
// extend user schema with refferedBy

export const affiliatePlugin = () => {
  const cookieGetter = (ctx: any) => {
    if (ctx.getCookie(AFFILIATE_COOKIE_NAME)) {
      return ctx.getCookie(AFFILIATE_COOKIE_NAME);
    }
    return null;
  };

  const routes = createRoutes();

  return {
    id: "affiliate",
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                async after(user, ctx) {
                  console.log({user})
                  if (!ctx){
                    return 
                  }
                  const cookie = parseSetCookieHeader(ctx?.request?.headers.get("cookie") || "");
                  console.log("cookie", cookie);
                  console.log("ctx.context.refferedBy", ctx?.context.refferedBy);
                  const code_owner = await ctx.context.adapter.findOne<{
                    id: string;
                  }>({
                    model: AFFILIATE_CODE_TABLE_NAME,
                    where: [{
                      field: "code",
                      value: ctx?.context.refferedBy,
                      operator: "eq",
                    }],
                  });
                  console.log("code_owner", code_owner);
                  if (code_owner && ctx) {
                    await ctx.context.adapter.create({
                      model: AFFILIATE_TABLE_NAME,
                      data: {
                        owner_id: code_owner.id,
                        invited_id: user.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                      },
                    });
                  }
                },
              },
            },
          },
        },
      };
    },
    hooks: {
      before: [
        {
          matcher: (ctx) => true,
          handler: createAuthMiddleware(async (ctx) => {
            const setCookie = ctx.request?.headers.get("cookie");
            console.log("setCookie", setCookie);
            if (setCookie) {
              const parsed = parseSetCookieHeader(setCookie);
              console.log("parsed", parsed);
              const outKookie = parsed.get(AFFILIATE_COOKIE_NAME);
              console.log("outKookie", outKookie);
              if (outKookie) {
                ctx.context.refferedBy = outKookie.value;
              }
            
            }
          }),
        },
      ],
    },
    endpoints: {
      generateLink: routes.generateLink,
      issueCookie: routes.issueCookie,
    },
    schema: {
      [AFFILIATE_CODE_TABLE_NAME]: {
        fields: {
          code: {
            type: "string",
            required: true,
          },
          user_id: {
            type: "string",
            references: { model: "user", field: "id", onDelete: "cascade" },
            required: true,
            input: false,
          },
          created_at: {
            type: "date",
            required: true,
            input: false,
          },
          updated_at: {
            type: "date",
            required: true,
            input: false,
          },
        },
      },
      [AFFILIATE_TABLE_NAME]: {
        fields: {
          // id of user who is owner of the code used to signup
          owner_id: {
            type: "string",
            references: { model: "user", field: "id", onDelete: "cascade" },
            required: true,
            input: false,
          },
          // id of user who signed up using the code
          invited_id: {
            type: "string",
            references: { model: "user", field: "id", onDelete: "cascade" },
            required: true,
            input: false,
          },
          created_at: {
            type: "date",
            required: true,
            input: false,
          },

          updated_at: {
            type: "date",
            required: true,
            input: false,
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};
