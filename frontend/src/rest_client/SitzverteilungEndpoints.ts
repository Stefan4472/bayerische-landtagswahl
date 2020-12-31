import http from "./CommonHTTP";

export interface SitzVerteilung {
    party_name: string,
    num_seats: number,
}

class SitzverteilungEndpoints {

    async getAll() : Promise<SitzVerteilung[]> {
        const result = await http.get("/results/sitzverteilung");
        return result.data as SitzVerteilung[];
    }
}

export default new SitzverteilungEndpoints();