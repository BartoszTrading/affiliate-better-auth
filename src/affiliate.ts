import crypto from "node:crypto";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { createRoutes } from "./routes";

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
    if (ctx.cookies.get(AFFILIATE_COOKIE_NAME)) {
      return ctx.cookies.get(AFFILIATE_COOKIE_NAME);
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
                  if (ctx?.context.refferedBy) {
                    await ctx.context.adapter.create({
                      model: AFFILIATE_TABLE_NAME,
                      data: {
                        owner_id: user.id,
                        invited_id: ctx.context.refferedBy,
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
          matcher: (ctx) => !!cookieGetter(ctx),
          handler: createAuthMiddleware(async (ctx) => {
            const cookie = cookieGetter(ctx);
            if (cookie) {
              ctx.context.refferedBy = cookie;
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
