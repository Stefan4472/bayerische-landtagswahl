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

export interface StimmkreisSieger {
    stimmkreis_name: string;
    stimmkreis_num: number;
    party_name: string;
    num_erststimmen: number;
    num_zweitstimmen:  number;
}

class StimmkreisEndpoints {

    async getAllInfo(year: number) : Promise<StimmkreisInfo[]> {
        const result = await http.get(`/${year}/stimmkreise`);
        return result.data as StimmkreisInfo[];
    }

    async getResults(year: number, stimmkreisNr: number) : Promise<Stimmkreis> {
        const result = await http.get(`/results/${year}/stimmkreis/${stimmkreisNr}`)
        return result.data as Stimmkreis;
    }

    async getAllSieger(year: number) : Promise<StimmkreisSieger> {
        const result = await http.get(`/results/${year}/stimmkreis-sieger`)
        return result.data as StimmkreisSieger;
    }
}

export default new StimmkreisEndpoints();