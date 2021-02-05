import http from "./CommonHTTP";

export interface Mitglied {
    first_name: string,
    last_name: string,
    party_name: string,
    wahlkreis_name: string,
    is_direct_candidate: boolean,
    stimmkreis_name: string,
    stimmkreis_num: string
}

class MitlgliederEndpoints {
    async getAll(year: number) : Promise<Mitglied[]> {
        const result = await http.get(`/results/${year}/mitglieder`);
        console.log(result);
        return result.data as Mitglied[];
    }
}

export default new MitlgliederEndpoints();