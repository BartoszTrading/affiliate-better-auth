import { generateLinkRoute } from "./generate-link";
import { issueCookieRoute } from "./issue-cookie";

export function createRoutes() {
  return {
    generateLink: generateLinkRoute(),
    issueCookie: issueCookieRoute(),
  };
}
