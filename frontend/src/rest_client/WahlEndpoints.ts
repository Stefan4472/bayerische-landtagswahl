import http from "./CommonHTTP";

class WahlEndpoints {

    async getAllYears() : Promise<number[]> {
        const result = await http.get(`/wahl-jahre`);
        return result.data as number[];
    }
}

export default new WahlEndpoints();