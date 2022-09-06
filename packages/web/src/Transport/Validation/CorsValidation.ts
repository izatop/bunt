import {Application, IRoute, IRouteMatcher, RegexpMatcher, RequestValidatorAbstract, RouteNotFound} from "@bunt/app";
import {ActionAny} from "@bunt/unit";
import {assert, isFunction, isString} from "@bunt/util";
import {Headers} from "../Headers";
import {ICorsOptions} from "../interfaces";
import {Responder} from "../Responder";
import {NoContentResponse} from "../Response";

type RouteTuple = [method: string, matcher: IRouteMatcher];

export class CorsValidation extends RequestValidatorAbstract<ICorsOptions> {
    public get origin(): ICorsOptions["origin"] {
        return this.options.origin;
    }

    public static factory(options: ICorsOptions = {}): CorsValidation {
        return new this(options);
    }

    public validate(app: Application<any>, request: Responder): void {
        if (request.isOptionsRequest()) {
            // Test route for the current OPTIONS request
            const routes = app.getRoutes();
            if (routes.some((route) => route.test(request.route))) {
                return;
            }

            const tuple = this.getRouteTuple(routes);
            const matchedRoutes = tuple.filter(([, matcher]) => matcher.test(request.route));
            assert(matchedRoutes.length > 0, () => new RouteNotFound("Not Found"));

            const methods = [...new Set(matchedRoutes.map(([m]) => m)).values()];
            const headers = this.getAccessControlHeaders(request, methods);

            throw new NoContentResponse({headers: new Headers(headers)});
        }

        const setHeaders: [string, string][] = [
            ["access-control-allow-origin", this.getAccessControlOrigin(request)],
        ];

        if (this.options.credentials) {
            setHeaders.push(["access-control-allow-credentials", "true"]);
        }

        const vary = this.getVary();
        if (vary) {
            setHeaders.push(["Vary", vary]);
        }

        request.setResponseHeaders(setHeaders);
    }

    protected getAccessControlHeaders(request: Responder, methods: string[]): [string, string][] {
        const acRequestHeaders = request.headers.get(
            "access-control-request-headers",
            "content-type, accept, authorization",
        );

        const headers: [string, string][] = [
            ["access-control-allow-origin", this.getAccessControlOrigin(request)],
            ["access-control-allow-headers", acRequestHeaders],
            ["access-control-allow-methods", methods.join(", ")],
            ["access-control-max-age", "86400"],
        ];

        const vary = this.getVary();
        if (vary) {
            headers.push(["Vary", vary]);
        }

        if (this.options.credentials) {
            headers.push(["access-control-allow-credentials", "true"]);
        }

        return headers;
    }

    protected getVary(): string | undefined {
        if (isString(this.options.origin) && this.options.origin === "origin") {
            return "Origin";
        }

        return;
    }

    protected getAccessControlOrigin(request: Responder): string {
        if (isString(this.origin)) {
            return this.origin === "origin" ? request.origin : this.origin;
        }

        if (isFunction(this.origin)) {
            return this.origin(request);
        }

        return "*";
    }

    protected getRouteTuple(routes: IRoute<ActionAny>[]): RouteTuple[] {
        return routes
            .filter((route) => /^(GET|POST|PUT|PATCH|DELETE)\s/i.test(route.route))
            .map(({route}) => route.split(/\s/))
            .map(([method, route]) => [method, new RegexpMatcher(`OPTIONS ${route}`)]);
    }
}
