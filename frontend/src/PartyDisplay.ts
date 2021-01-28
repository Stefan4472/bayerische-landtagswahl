// Defines how to display the main parties.
// NOTE: This file will need to be updated if new major parties emerge!

export const MAIN_PARTIES = new Set([
    'CSU',
    'SPD',
    'FREIE WÄHLER',
    'GRÜNE',
    'FDP',
    'DIE LINKE',
    'AfD',
]);

export const MAIN_PARTY_COLORS = new Map([
    ['CSU', '#90caf9'],
    ['SPD', '#ef5350'],
    ['FREIE WÄHLER', '#ffb74d'],
    ['GRÜNE', '#66bb6a'],
    ['FDP', '#ffee58'],
    ['DIE LINKE', '#ab47bc'],
    ['AfD', '#5c6bc0'],
]);

export const MAIN_PARTY_ORDER = new Map([
    ['CSU', 0],
    ['SPD', 1],
    ['FREIE WÄHLER', 2],
    ['GRÜNE', 3],
    ['FDP', 4],
    ['DIE LINKE', 5],
    ['AfD', 6],
]);

export function orderParties(partyList: {party_name: string}[]) : any[] {
    let main_parties: any[] = [];
    let minor_parties: any[] = [];
    for (const party_obj of partyList) {
        if (MAIN_PARTIES.has(party_obj.party_name)) {
            main_parties.push(party_obj);
        }
        else {
            minor_parties.push(party_obj);
        }
    }
    // Sort main parties by order
    // @ts-ignore
    main_parties.sort((a, b) => (MAIN_PARTY_ORDER.get(a.party_name) > MAIN_PARTY_ORDER.get(b.party_name) ? 1 : -1));
    // Sort minor parties alphabetically
    minor_parties.sort((a, b) => (a.party_name > b.party_name) ? 1 : -1);

    let result = main_parties.concat(minor_parties);
    console.log(partyList, ' transformed to ', result);

    return result;
}