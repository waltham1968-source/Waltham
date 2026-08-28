from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
DATA={
"dk":("Idé, ejerskab og fortrolighed","Det, I deler, forbliver jeres.","Waltham behandler henvendelsen diskret og følger gældende regler om ophavsret, fortrolighed og persondata. Beskriv idéen overordnet i den første e-mail; hvis detaljer kræver det, aftaler vi fortrolighed, før de deles.","Del ikke følsomme personoplysninger eller forretningshemmeligheder i den første e-mail."),
"no":("Idé, eierskap og konfidensialitet","Det dere deler, forblir deres.","Waltham behandler henvendelsen diskret og følger gjeldende regler om opphavsrett, fortrolighet og personvern. Beskriv ideen overordnet i den første e-posten; hvis detaljer krever det, avtaler vi konfidensialitet før de deles.","Ikke del sensitive personopplysninger eller forretningshemmeligheter i den første e-posten."),
"en":("Idea, ownership and confidentiality","What you share remains yours.","Waltham handles the enquiry discreetly and follows applicable rules on copyright, confidentiality and data protection. Describe the idea at a high level in the first email; if details require it, we will agree confidentiality before they are disclosed.","Do not share sensitive personal data or trade secrets in the first email."),
"de":("Idee, Eigentum und Vertraulichkeit","Was Sie teilen, bleibt Ihres.","Waltham behandelt die Anfrage diskret und beachtet die geltenden Regeln zu Urheberrecht, Vertraulichkeit und Datenschutz. Beschreiben Sie die Idee in der ersten E-Mail allgemein; wenn Details es erfordern, vereinbaren wir vor deren Offenlegung Vertraulichkeit.","Teilen Sie in der ersten E-Mail keine sensiblen personenbezogenen Daten oder Geschäftsgeheimnisse.")}

for code,t in DATA.items():
    title,owner,details,email=t
    block=f'<aside class="wrap venture-trust"><p class="label">{title}</p><div><h3>{owner}</h3><p>{details}</p><small>{email}</small></div></aside>'
    path=ROOT/code/'waltham-ventures.html'
    html=path.read_text(encoding='utf-8')
    if 'venture-trust' in html:
        html=re.sub(r'<aside class="wrap venture-trust">.*?</aside>',block,html,count=1,flags=re.S)
    else:
        html=html.replace('<section class="section wrap" id="contact">',block+'<section class="section wrap" id="contact">',1)
    path.write_text(html,encoding='utf-8')
