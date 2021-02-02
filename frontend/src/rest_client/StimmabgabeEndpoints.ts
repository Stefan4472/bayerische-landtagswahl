import http from "./CommonHTTP";

export interface BallotCandidate {
    party_name: string,
    first_name: string,
    last_name: string,
    id: number,
}

export interface BallotInfo {
    stimmkreis: string,
    stimmkreis_nr: number,
    direct_candidates: BallotCandidate[],
    list_candidates: BallotCandidate[],
}

export interface VoteResult {
    success: boolean,
    message: string,
}

class StimmabgabeEndpoints {

    async getWahlInfo(voterKey: string) : Promise<BallotInfo[]> {
        const result = await http.get('/voting/' + voterKey);
        console.log(result);
        return result.data as BallotInfo[];
    }

    async submitVote(voterKey: string, directCandidate?: BallotCandidate, listCandidate?: BallotCandidate) : Promise<VoteResult> {
        const result = await http.post(
            '/voting/' + voterKey,
            {
                    'directID': directCandidate ? directCandidate.id : -1,
                    'listID': listCandidate ? listCandidate.id : -1,
            }
        )
        return result.data as VoteResult;
    }
}

export default new StimmabgabeEndpoints();