import http from "./CommonHTTP";

export interface PartyBestStimmkreis {
    party_name: string
    stimmkreis_name: string
    stimmkreis_num: number
    num_gesamtstimmen: number
    pct_gesamtstimmen: number
}

export interface StimmkreisSwing {
    stimmkreis_name: string
    stimmkreis_num: number
    wahlkreis_name: string
    pct_change_left: number
    pct_change_right: number
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

    async getStimmkreisSwings(year: number) : Promise<StimmkreisSwing[]> {
        const result = await http.get(`/results/${year}/swings`);
        return result.data as StimmkreisSwing[];
    }
}

export default new WahlEndpoints();