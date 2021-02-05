import http from "./CommonHTTP";

export interface StimmkreisInfo {
    id: number;
    name: string;
    number: number;
}

export interface StimmkreisPartyResult {
    party_name: string;
    candidate_fname: string;
    candidate_lname: string;
    erst_stimmen: number;
    zweit_stimmen: number;
    gesamt_stimmen: number;
    gesamt_percent: number;
    change_percent: number|null;
}

export interface StimmkreisRaw {
    'turnout_percent': number
    'winner_fname': string
    'winner_lname': string
    'winner_party': string
    'results': StimmkreisPartyResult[]
}

export interface Stimmkreis {
    id: number;
    name: string;
    number: number;
    turnout_percent: number;
    winner_fname: string;
    winner_lname: string;
    winner_party: string;
    results: StimmkreisPartyResult[];
}

class StimmkreisEndpoints {

    async getAllInfo(year: number) : Promise<StimmkreisInfo[]> {
        const result = await http.get(`/${year}/stimmkreise`);
        return result.data as StimmkreisInfo[];
    }

    async getResults(year: number, stimmkreisNr: number) : Promise<StimmkreisRaw> {
        const result = await http.get(`/results/${year}/stimmkreis/${stimmkreisNr}`)
        console.log(result.data);
        return result.data as Stimmkreis;
    }
}

export default new StimmkreisEndpoints();