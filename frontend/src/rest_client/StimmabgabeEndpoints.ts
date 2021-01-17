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
            'direkt_candidates': [
                {
                    'partei': 'CSU',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 1,
                },
                {
                    'partei': 'SPD',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 2,
                },
                {
                    'partei': 'FDP',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 3,
                },
            ],
            'list_candidates': [
                {
                    'partei': 'CSU',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'partei': 'SPD',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'partei': 'FDP',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'partei': 'CSU',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'partei': 'SPD',
                    'first_name': 'Sebastian',
                    'last_name': 'Wahl',
                    'id': 4,
                },
                {
                    'partei': 'FDP',
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