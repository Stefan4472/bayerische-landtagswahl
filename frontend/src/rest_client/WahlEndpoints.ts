import http from "./CommonHTTP";

class WahlEndpoints {

    async getAllYears() : Promise<number[]> {
        const result = await http.get(`/wahl-jahre`);
        return result.data as number[];
    }

    async forceDataRefresh() {
        await http.put('/results/force-update');
    }
}

export default new WahlEndpoints();