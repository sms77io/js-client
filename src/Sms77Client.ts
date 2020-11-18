import {
    AnalyticsParams,
    AnalyticsResponse,
    ContactsParams,
    ContactsResponse,
    LookupParams,
    LookupResponse,
    PricingParams,
    PricingResponse,
    SmsParams,
    SmsResponse,
    StatusParams,
    StatusResponse,
    ValidateForVoiceParams,
    ValidateForVoiceResponse,
    VoiceParams,
    VoiceResponse,
} from './types';
import {SUCCESS_CODES} from './constants/SUCCESS_CODES';
import {BaseClient} from './BaseClient';
import {Endpoint} from './constants/enums/Endpoint';
import TextTransformer from './lib/TextTransformer';
import {ContactsAction} from './constants/enums/ContactsAction';

export * from './types';

export default class Sms77Client extends BaseClient {
    analytics = async (p?: AnalyticsParams): Promise<AnalyticsResponse> =>
        (await this.get<AnalyticsResponse>(Endpoint.Analytics, p) as AnalyticsResponse);

    balance = async (): Promise<number> =>
        Number.parseFloat(await this.get<string>(Endpoint.Balance, {}));

    contacts = async (p: ContactsParams): Promise<ContactsResponse> => {
        const args: [Endpoint, ContactsParams] = [Endpoint.Contacts, p];
        const method = p.action === ContactsAction.Del ? this.post : this.get;
        const res = await method<ContactsResponse>(...args);
        const type = typeof res;
        const isCSV = type === 'string';
        const isCode = type === 'number';

        if (isCSV || isCode) {
            return res;
        } else if (Array.isArray(res)) {
            return res;
        }

        if (typeof res === 'object') {
            if (SUCCESS_CODES.has(Number.parseInt(res.return))) {
                if (res.id) {
                    return Number.parseInt(res.id);
                } else if (p.id) {
                    return p.id;
                }
            }
        }

        return res;
    };

    lookup = async (p: LookupParams): Promise<LookupResponse> =>
        await this.post<LookupResponse>(Endpoint.Lookup, p);

    pricing = async (p?: PricingParams): Promise<PricingResponse> =>
        await this.post<PricingResponse>(Endpoint.Pricing, p);

    sms = async (p: SmsParams): Promise<SmsResponse> =>
        await this.post(Endpoint.Sms, p);

    status = async (p: StatusParams): Promise<StatusResponse> => {
        const res = await this.get<string>(Endpoint.Status, p);

        return p._json ? TextTransformer.status(res) : res;
    };

    validateForVoice = async (p: ValidateForVoiceParams):
        Promise<ValidateForVoiceResponse> =>
        (await this.post<ValidateForVoiceResponse>
        (Endpoint.ValidateForVoice, p) as ValidateForVoiceResponse);

    voice = async (p: VoiceParams): Promise<VoiceResponse> => {
        const res = await this.post<string>(Endpoint.Voice, p);

        return p._json ? TextTransformer.voice(res) : res;
    };
}