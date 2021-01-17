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

class StimmabgabeEndpoints {

    async getWahlInfo(voterKey: string) {
        return {
            'stimmkreis': 'München-Hadern',
            'stimmkreis_nr': 101,
            'direct_candidates': [
                {
                    'party_name': 'CSU',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 1,
                },
                {
                    'party_name': 'SPD',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 2,
                },
                {
                    'party_name': 'FDP',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 3,
                },
            ],
            'list_candidates': [
                {
                    'party_name': 'CSU',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'party_name': 'SPD',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'party_name': 'FDP',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'party_name': 'CSU',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'party_name': 'SPD',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'party_name': 'FDP',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
            ],
        }
    }

    async submitVote(voterKey: string, direkt: string, list: string) {
        return {
            'success': true,
            'message': '',
        }
    }
}

export default new StimmabgabeEndpoints();