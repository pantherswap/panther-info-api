import { VercelRequest, VercelResponse } from "@vercel/node";
import { getGlobalData } from "../utils/exchange";
import { return200, return500 } from "../utils/response";

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const globalData = await getGlobalData();
    return200(res, { updated_at: new Date().getTime(), data: globalData });
  } catch (error) {
    return500(res, error);
  }
}
