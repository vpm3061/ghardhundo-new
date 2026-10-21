# Registration city suggestions

`registration-up-cities.json` contains city and district names extracted from the municipal corporation, municipality and nagar panchayat tables in the [UP urban local bodies directory](https://en.wikipedia.org/wiki/List_of_urban_local_bodies_in_Uttar_Pradesh), retrieved 2026-10-21. Only geographical names are retained; elected officials, parties and population figures are excluded.

Regional references: [UP government district profiles](https://nri.up.gov.in/en/page/district-profiles) and [NCR Planning Board constituent areas](https://ncrpb.nic.in/ncrconstituent.html).

`registration-cities.ts` adds development-authority cities and NCR city/town suggestions. Duplicate town names in different UP districts are disambiguated with their district. This is a suggestion directory rather than a claim to enumerate every village, locality or newly constituted town. The registration field also accepts a manually entered city, so an omitted name never prevents registration. Existing saved city values remain valid.
