import http from "./CommonHTTP";

export interface PartyBestStimmkreis {
    party_name: string
    stimmkreis_name: string
    stimmkreis_num: number
    num_gesamtstimmen: number
    pct_gesamtstimmen: number
}

class WahlEndpoints {

    async getAllYears() : Promise<number[]> {
        const result = await http.get(`/wahl-jahre`);
        return result.data as number[];
    }

    async forceDataRefresh() {
        await http.put('/results/force-update');
    }

    async getPartyBestStimmkreise(year: number) : Promise<PartyBestStimmkreis[]> {
        const result = await http.get(`/results/${year}/party-bests`);
        return result.data as PartyBestStimmkreis[];
    }
}

export default new WahlEndpoints();