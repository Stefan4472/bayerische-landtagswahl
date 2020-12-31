import http from "./CommonHTTP";

export interface Mitglied {
    first_name: string,
    last_name: string,
    party_name: string,
    wahlkreis_name: string,
}

class MitlgliederEndpoints {

    async getAll() : Promise<Mitglied[]> {
        let year = 2018;
        const result = await http.get(`/results/${year}/mitglieder`);
        return result.data as Mitglied[];
    }
}

export default new MitlgliederEndpoints();