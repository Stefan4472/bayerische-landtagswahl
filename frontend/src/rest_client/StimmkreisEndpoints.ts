import http from "./CommonHTTP";

export interface StimmkreisInfo {
    id: number;
    name: string;
    number: number;
}

// TODO: NAMING IS CONFUSING
export interface StimmkreisResult {
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
    results: StimmkreisResult[];
}

class StimmkreisEndpoints {

    async getAllInfo() : Promise<StimmkreisInfo[]> {
        const result = await http.get("/stimmkreise");
        console.log(result.data);
        return result.data as StimmkreisInfo[];
    }


    async getResults(stimmkreisNr: number) {
        const result = await http.get('/results/stimmkreis/' + stimmkreisNr)
        return result.data as Stimmkreis;
    }
}

export default new StimmkreisEndpoints();