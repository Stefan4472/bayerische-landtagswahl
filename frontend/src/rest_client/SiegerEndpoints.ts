import http from "./CommonHTTP";

export interface StimmkreisSieger {
    wahlkreis: string;
    stimmkreis_name: string;
    stimmkreis_num: number;
    party_name: string;
    num_erststimmen: number;
    num_zweitstimmen:  number;
    percent: number;
}

export interface KnappsteSieger {
    stimmkreis_name: string
    stimmkreis_num: number
    party_name: string
    candidate_fname: string
    candidate_lname: string
    win_margin: number
}

export interface KnappsteVerlierer {
    stimmkreis_name: string
    stimmkreis_num: number
    party_name: string
    candidate_fname: string
    candidate_lname: string
    lose_margin: number
}

class SiegerEndpoints {

    async getAllSieger(year: number) : Promise<StimmkreisSieger> {
        const result = await http.get(`/results/${year}/stimmkreis-sieger`)
        return result.data as StimmkreisSieger;
    }

    async getKnappsteSieger(year: number) : Promise<KnappsteSieger[]> {
        const result = await http.get(`/results/${year}/knappste-sieger`);
        return result.data as KnappsteSieger[];
    }

    async getKnappsteVerlierer(year: number) : Promise<KnappsteVerlierer[]> {
        const result = await http.get(`/results/${year}/knappste-verlierer`);
        return result.data as KnappsteVerlierer[];
    }
}

export default new SiegerEndpoints();