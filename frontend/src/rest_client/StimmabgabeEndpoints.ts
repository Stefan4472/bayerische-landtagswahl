import http from "./CommonHTTP";

export interface BallotCandidate {
    party_name: string,
    first_name: string,
    last_name: string,
    id: number,
}

export interface BallotParty {
    party_name: string
    id: number
}

export interface BallotInfo {
    stimmkreis: string,
    stimmkreis_nr: number,
    direct_candidates: BallotCandidate[],
    list_candidates: BallotCandidate[],
    parties: BallotParty[],
}

export interface VoteResult {
    success: boolean,
    message: string,
}

export interface CompletedBallot {
    directCandidate?: BallotCandidate
    listCandidate?: BallotCandidate
    listParty?: BallotParty
}

class StimmabgabeEndpoints {

    async getWahlInfo(voterKey: string) : Promise<BallotInfo[]> {
        const result = await http.get('/voting/' + voterKey);
        return result.data as BallotInfo[];
    }

    async submitVote(voterKey: string, completedBallot: CompletedBallot) : Promise<VoteResult> {
        let data: any = {};
        if (completedBallot.directCandidate) {
            data["directID"] = completedBallot.directCandidate.id;
        }
        if (completedBallot.listCandidate) {
            data["listID"] = completedBallot.listCandidate.id;
        }
        if (completedBallot.listParty) {
            data["partyID"] = completedBallot.listParty.id;
        }
        const result = await http.post(
            '/voting/' + voterKey,
            data,
        )
        return result.data as VoteResult;
    }
}

export default new StimmabgabeEndpoints();