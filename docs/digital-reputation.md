# Digitalt rykte — førsteversjon

Fire språkversjoner med inngang fra forsiden. Eget navn, valgfri by/yrke/virksomhet og bekreftelse på at dette er eget navn.
Ingen registrering, navnlogging, lagring i nettleseren eller e-postvarsling.
Navn/kontekst sendes til OpenAI for nettsøk; informasjon før innsending.
Responses API brukes med store:false. Dette slår av lagring av Responses-objektet; det er ikke en garanti om null databehandling/retensjon hos leverandøren.
Bare fullførte nettsøk med klikkbare kildehenvisninger vises. Ingen ryktekarakter.
Identitet og navnebrødre skal skilles, og private detaljer og sensitive påstander skal utelates.
Modellinstruksjoner er ikke en garanti: kontroller faktiske resultater før publisering.

## Status og aktivering
Netlifys liste over miljøvariabler viser GOOGLE_PLACES_API_KEY, men ingen OPENAI_API_KEY (kontrollert 5. oktober 2026).
Legg inn OPENAI_API_KEY som hemmelig verdi med Functions-scope i Netlify; ikke i repoet eller chatten.
Valgfri OPENAI_REPUTATION_MODEL; ellers eksisterende OPENAI_MARKET_MODEL eller gpt-5-mini.
Rate limit er tre søk per fem minutter per IP/domene. API-søk bruker betalt modell/nettsøk.
Søk må verifiseres med et godkjent eget navn etter aktivering, før live-publisering.
38 kontroller bestod lokalt. Eldre homepage-heading-tester forventer den tidligere forsiden og feiler allerede på grunnversjonen; endringen reparerer ikke disse.
