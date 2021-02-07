import React from "react";
import {orderParties} from "../util/PartyDisplay";
import {ListGroup} from "react-bootstrap";
import {BallotParty} from "../../rest_client/StimmabgabeEndpoints";

interface Props {
    parties: BallotParty[];
    onPartySelected: (party: BallotParty) => void;
    selectedParty?: BallotParty;
}

export const PartySelector: React.FC<Props> = (props: Props) => {

    return (
        <div>
            {orderParties(props.parties).map(party =>
                <ListGroup.Item
                    action
                    active={party === props.selectedParty}
                    onClick={() => {
                        props.onPartySelected(party)
                    }}
                    key={'party-' + party.id}
                >
                    {party.party_name}
                </ListGroup.Item>
            )}
        </div>
    )
}