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

    async getWahlInfo(voterKey: string) {
        const result = await http.get(`/voting/{voterKey}`);
        return result.data as BallotInfo[];
    }

    async submitVote(voterKey: string, directCandidate?: BallotCandidate, listCandidate?: BallotCandidate) {
        return {
            'success': true,
            'message': '',
        }
    }
}

export default new StimmabgabeEndpoints();