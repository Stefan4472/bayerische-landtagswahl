## Bayerische Landtagswahl Pflichtenheft

*Vlad Kolesnykov & Stefan Kussmaul*

DatenbankSysteme (Prof. Kemper)

## 1. User Interfaces

### Results Interface

The results interface provides a detailed report about the election and parliamentary assignments. It displays statewide results (e.g. parliamentary allocations), as well as results by region (Wahlkreis) and by county (Wahlbezirk). The interface makes heavy use of visual displays (e.g. tables, pie charts, line charts) in order to provide data in an intuitive and visually-appealing way. Finally, the interface allows the user to compare all results against results from other election years for which data is available.

#### State-Wide Results

The results interface provides a graphical visualization of the state-wide results. This includes:

- Number of seats allocated to each party (bar chart, pie chart, and table)
- Percentage and count of first votes and second votes per party (pie chart and table)

The results interface also tracks certain key statistics:

- Turnout (number of ballots cast)
- Number of registered voters
- Turnout rate (percentage of registered voters who cast ballots)

Furthermore, there is a table with information about every person who has received a seat in Parliament. The user will be able to filter members by region, and to sort members by number of votes received. The table will display the following information for each candidate:

- Full name
- Gender
- Year of birth
- Place of residence
- Associated party/group (if any)
- How they were elected (direct mandate or list mandate)
- Number of votes received (if direct candidate)
- County elected in (if direct candidate)

#### Regional results (Wahlkreis)

The results interface provides a graphical visualization of the regional results. This includes:

- Population of region and number of direct mandates
- Number of seats allocated to each party for this region (bar chart, pie chart, and table)
- Percentage and count of first votes and second votes per party for this region (pie chart and table)

The results interface also tracks certain key statistics for the region:

- Turnout (number of ballots cast)
- Number of registered voters
- Turnout rate (percentage of registered voters who cast ballots)

#### County results (Wahlbezirk)

The results interface provides a graphical visualization of county results. This includes:

- Population of county
- Direct candidates running for election, and number of votes received by each
- The direct candidate winner
- Percentage and count of first votes and second votes per party for this region (pie chart and table)

The results interface also tracks certain key statistics for this county:

- Turnout (number of ballots cast)
- Number of registered voters
- Turnout rate (percentage of registered voters who cast ballots)
- Polling-Place interface

### Polling-Place interface

This interface is to be used by poll workers in order to administer voting at the polling place (Wahllokal). This interface is not a current requirement, but may be necessary in the future.

Potential features:

- Look up voter information to see if a voter is registered at this polling place
- Check that a voter has not already voted
- Voter interface

This interface is to be used by voters in order to enter their votes into the system. This interface is not a current requirement, but may be necessary in the future. 

### Voter interface

Potential features:

- Allow voter to log-in as themselves using their identifying information
- Allow voter to submit a vote for a candidate running in their county (First Vote)
- Allow voter to submit a vote for a list candidate running in their region (Second Vote)

Ensure that no voter can vote twice

## 2. Functional Requirements

**FR1**: The system must have the capacity to store tens of millions of voter data records. For example, in the 2018 elections, there were approximately 9.5 million registered voters*.

**FR2**: The system must have the capacity to store tens of millions of vote records. For example, roughly 7 million people voted in 2018*.

**FR3**: The system must store information for all officially-recognized political parties.

**FR4**: The system must allow election officials to access and modify information about individual parties. It must also allow election officials to register new parties in the system.

**FR5**: The system must store information for all officially-recognized candidates (direct candidates and list candidates).

**FR6**: The system must allow election officials to access and modify information about individual candidates. It must also allow election officials to register new candidates in the system. Direct candidates must be registered for a specific county. List candidates must be registered for a specific party and region. Each candidate must have the following information:

- Full name
- Associated party (if any)
- County and Region
- Gender
- Year of birth
- Place of residence
- Differentiate between direct and list candidates

**FR7**: The system must be able to correctly calculate parliamentary seat allocations based on voting records from an election. It must use the Hare-Niemayer method, observe the “5% hurdle” rule, and correctly handle “Overhang” mandates.

**FR8**: The system must be reusable for elections in different years. It must be able to store the data from multiple elections.

**FR9**: The system must produce statistics about voting trends at the state, regional, and county levels. This includes:
Number of votes for each party
Percentage of votes for each party

**FR10**: The system must be able to compare statistics between any two elections for which there is data in the system.

*Data from official 2018 results: www.bayern.landtag.de

## 3. Non-Functional Requirements

**NFR1**: The system must protect user data. Votes must be secret and anonymous. Database access and modification must be restricted to specific government individuals.

**NFR2**: Because the system is integral to The State of Bavaria’s government, data integrity must be preserved. The system must follow modern guidelines for cyber security.

**NFR3**: The system must never lose data. Recovery of data must be possible after catastrophic failure.

**NFR4**: The system must be able to support a very high amount of concurrent access. Submitting a vote should return a confirmation of success or failure within 10 seconds.

**NFR5**: The results interface must be visually appealing and intuitive to use.

## 4. Criteria for Acceptance

**CA1**: All artifacts (e.g. source code, documentation, tests) must be delivered by the project deadline.

**CA2**: All functional and non-functional requirements must be fulfilled.

**CA3**: The system must pass a stress test in which 500 votes are submitted per second for five minutes.
