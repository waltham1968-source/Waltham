# Nyborg Erhvervsatlas – ændringsrapport, 1. november 2026

## Udgangspunkt og versioner
- Produktion: www.waltham.dk, Netlify. GitHub Pages publicerer alene en viderestillingsside.
- Aktuel hovedgren ved opstart: 66e8266. Den gamle lokale GitHub-kopi var 108 commits bagud og havde lokale sletninger. Den er ikke ændret; arbejdet er udført i en separat frisk klon.
- Den eksisterende offentlige Markedspladsmodel matcher repository-indholdet; Netlify omskriver visse links og indsætter egen besøgsstatistik.
- Strategisk ramme: Google Drive-dokumentet “Nyborg mellem linjerne – redaktionsplan og 10 artikler – 2026”, læst 1. november 2026, senest ændret samme dag. Nye brugerkrav om anonymitet går forud for ældre muligheder for navngivne illustrationer.

## Implementering
- /nyborg-erhvervsatlas/: introduktion, pilotstatus, fem gratis råd, artikeloversigt, metode, rettelser og anonymitetsløfte.
- /artikler/hvorfor-ai-vil-se-beviser/: praktisk vejledning og afgrænsning af AI-påstande.
- /artikler/markedspladsen-har-faaet-en-ny-kunde/: internationale data og eksplicit lokal arbejdshypotese.
- /dk/markedsplassmodellen.html bevares som eksisterende permanent adresse. Den foreslåede /artikler/den-nye-digitale-markedsplads/ giver 301 til den eksisterende model, så samme forklaring ikke kopieres.
- Indbyrdes links samt indgange fra forsiden, videnscentret og artikelarkivet. Eksisterende artikler og PDF-links bevares.
- Unikke titler, beskrivelser, canonical, Open Graph, strukturerede data, illustrationsreference og datoer. Nye canonical-adresser tilføjet sitemap; index.html-aliaser omdirigeres.
- Generiske /artikler/-stier og fælles erhvervsatlas-stil kan genbruges geografisk. Nyborg-adressen bevares ved senere udvidelse. Ingen database eller filtre er lanceret.

## Redaktion og databeskyttelse
- Ingen nye lokale måleresultater hævdes. 80 % er tydeligt beskrevet som uformelt, ikke-repræsentativt og udokumenteret skøn.
- Verificerede Pew-tal: 8 % mod 15 % klik på traditionelle resultater, amerikanske browserdata fra marts 2025; genindsamling i april og observationelle begrænsninger forklaret. Ingen overførsel til Nyborg eller påstand om kausalitet.
- Google Search Centrals aktuelle vejledning verificeret. Ingen garanti for indeksering eller AI-anbefalinger. SparkToro-tal er ikke genbrugt uden selvstændig verifikation.
- Ingen offentlige virksomhedsdata, scorer, citater eller ranglister. Minimum 10 virksomheder pr. fremtidig resultatgruppe samt særskilt kontrol mod indirekte identifikation, restgrupper og kombinationer. Ti alene er ikke tilstrækkelig anonymitet.

## Kontrol
- 8 eksisterende relevante tests bestået: artikelpublicering og forsidens automatiske artikeludvælgelse.
- Nye siders interne links, fragmenter, filer, canonical, én H1, JSON-LD og sitemap-XML kontrolleret.
- Lokal browservisning kontrolleret på smal mobil og desktop. Ingen nye formularer eller firmasøgning.
- Næste konkrete faglige handling: fastlæg udvælgelse og koderegler for lokal screening, gennemfør kvalitetssikring og offentliggør først derefter samlede fund.
