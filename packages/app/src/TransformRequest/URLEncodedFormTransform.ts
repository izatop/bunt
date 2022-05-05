import {parse, ParsedUrlQuery} from "querystring";
import {IRequest} from "../interfaces";

export const URLEncodedFormTransform = async (request: IRequest): Promise<ParsedUrlQuery> => {
    request.headers.assert("Content-Type", "application/x-www-form-urlencoded");
    const buffer = await request.getBuffer();
    
    return parse(buffer.toString("utf-8"));
};
