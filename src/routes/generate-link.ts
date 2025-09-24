import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { generateRandomCode } from "../affiliate";

export function generateLinkRoute() {
  return createAuthEndpoint(
    "/affiliate/generate-link",
    {
      method: "GET",
      metadata: {
        openapi: {
          summary: "Generate affiliate link",
          description:
            "Returns an existing or newly generated affiliate code for the authenticated user.",
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      link: {
                        type: "string",
                        description: "Affiliate code for the current user",
                      },
                    },
                    required: ["link"],
                  },
                },
              },
            },
          },
        },
      },
    },
    async (ctx) => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new Error("Unauthorized");
      }
      const codeExists = await ctx.context.adapter.findOne<{
        code: string;
        user_id: string;
      }>({
        model: "affiliate_code",
        where: [
          {
            field: "user_id",
            value: session.user.id,
            operator: "eq",
          },
        ],
      });
      if (codeExists) {
        return { link: codeExists.code };
      }
      const affiliateCode = generateRandomCode();

      await ctx.context.adapter.create({
        model: "affiliate_code",
        data: {
          user_id: session.user.id,
          code: affiliateCode,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return { link: affiliateCode };
    },
  );
}
