import http from "./CommonHTTP";

export interface UeberhangMandat {
    party_name: string,
    wahlkreis_name: string,
    num_mandates: number,
}

class UeberhangMandateEndpoints {

    async getAll(year: number) : Promise<UeberhangMandat[]> {
        const result = await http.get(`/results/${year}/ueberhangmandate`);
        return result.data as UeberhangMandat[];
    }
}

export default new UeberhangMandateEndpoints();