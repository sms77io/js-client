import {ERROR_CODES} from './constants/ERROR_CODES';
import Util from './lib/Util';
import {Endpoint} from './constants/enums/Endpoint';
import {AnyObject} from './types';

const METHODS = ['get', 'post'] as const;
export type Response<R> = R | string;
export type Method = (typeof METHODS)[number];
export type MethodArgs = [Endpoint, AnyObject | undefined | null]

export type MethodCall = <R>(...a: MethodArgs) => Promise<Response<R>>;

interface HttpMethods {
    get: MethodCall
    post: MethodCall
}

export class BaseClient implements HttpMethods {
    get = async <R>(...a: MethodArgs): Promise<Response<R>> => '';
    post = async <R>(...a: MethodArgs): Promise<Response<R>> => '';

    private assertIs<T>(value: unknown): asserts value is T {
    }

    public static readonly BASE_URL = 'https://gateway.sms77.io/api';

    constructor(
        protected apiKey: string,
        protected sentWith: string = 'js',
        protected debug: boolean = false) {
        this.assertIs<{ [k in Method]: MethodCall }>(this);

        for (const name of METHODS) {
            this[name] =
                async <R>(...a: MethodArgs): Promise<Response<R>> =>
                    await this.request<R>(name, a);
        }
    }

    private async request<R>(method: Method, [e, o = {}]: MethodArgs):
        Promise<Response<R>> {
        let url = `${BaseClient.BASE_URL}/${e}`;
        const opts: RequestInit = {
            headers: {
                Authorization: `Basic ${this.apiKey}`,
                sentWith: this.sentWith,
            },
            method,
        };

        if (o && Object.keys(o).length) {
            o = this.normalizePayload(o);
            const entries = Object.entries(o);

            const params = new URLSearchParams;

            entries.forEach((([k, v]) => params.set(k, v)));

            'get' === method
                ? url += `?${params.toString()}` : opts.body = params;
        }

        const res = await fetch(url, opts);
        let body = await res.text();

        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch(e) {}
        }

        let apiCode: number | null = null;

        if (typeof body === 'string' || typeof body === 'number') {
            const parsed = Number.parseFloat(`${body}`);

            if (Number.isInteger(parsed)) {
                apiCode = parsed;
            }
        }

        if (this.debug) {
            console.debug({
                request: {
                    ...opts,
                    url,
                    body: opts.body instanceof URLSearchParams
                        ? Object.fromEntries(opts.body) : opts.body,
                },
                response: {
                    apiCode,
                    body,
                    headers: Object.fromEntries(res.headers),
                    status: res.status,
                },
            });
        }

        if (apiCode && ERROR_CODES.has(apiCode)) {
            throw new Error(`${apiCode}: ${ERROR_CODES.get(apiCode)}`);
        }

        return body;
    }

    private normalizePayload = (o: AnyObject): AnyObject => Object.fromEntries(
        Object.entries(o).map(([k, v]) => [k, Util.toNumberedBool(v)]));
}