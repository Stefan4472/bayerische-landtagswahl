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
    gesamt_stimmen: number;
}

export interface Stimmkreis {
    id: number;
    name: string;
    number: number;
    turnout_percent: number;
    results: StimmkreisPartyResult[];
}

class StimmkreisEndpoints {

    async getAllInfo() : Promise<StimmkreisInfo[]> {
        let year = 2018;
        const result = await http.get(`/${year}/stimmkreise`);
        return result.data as StimmkreisInfo[];
    }

    async getResults(stimmkreisNr: number) : Promise<Stimmkreis> {
        let year = 2018;
        const result = await http.get(`/results/${year}/stimmkreis/${stimmkreisNr}`)
        return result.data as Stimmkreis;
    }
}

export default new StimmkreisEndpoints();