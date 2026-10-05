# Synlighetstest: domeneliste og e-postvarsling

Teststart registreres i Netlify Forms, skjema `visibility-usage`.
Feltene er domene og tidspunkt (UTC), pluss skjemanavn og varselemne.
URL-sti, søkeparametre, navn og e-post sendes ikke fra testskjemaet.
Netlify kan lagre egne tekniske metadata for innsendingene.
Registreringen kjører uavhengig av analysen; feil stopper ikke testen.
Nettleserblokkering eller Netlifys spamfilter kan føre til at bruk ikke registreres.

Etter publisering:
1. Kontroller at Forms-detection er aktivert for nettstedet i Netlify.
2. Åpne Forms → visibility-usage for listen. Listen kan eksporteres som CSV.
3. Åpne Forms → Submission notifications → Add notification → Email.
4. Velg visibility-usage og mottakeradressen brukeren bekrefter.
5. Gjennomfør én test og kontroller både registreringen og mottatt e-post.

Tidligere tester kan ikke hentes tilbake. E-postvarsling er ikke aktiv før
innstillingen i Netlify er lagret og en faktisk levering er kontrollert.
