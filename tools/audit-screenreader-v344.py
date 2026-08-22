#!/usr/bin/env python3
"""Auditoria estática de fundamentos para leitores de tela."""
from pathlib import Path
from lxml import html

ROOT=Path(__file__).resolve().parents[1]
errors=[];warnings=[]
pages=[*ROOT.glob("*.html"),*ROOT.glob("products/*.html")]
for path in pages:
    doc=html.fromstring(path.read_text(encoding="utf-8"))
    def err(kind,value=""):errors.append(f"{path.relative_to(ROOT)}: {kind} {value}".rstrip())
    if (doc.get("lang") or "").lower()!="pt-br":err("idioma ausente ou incorreto")
    if len(doc.xpath("//title[normalize-space()]"))!=1:err("título de página ausente")
    if len(doc.xpath("//main"))!=1:err("deve existir exatamente um main")
    if len(doc.xpath("//h1"))!=1:err("deve existir exatamente um h1")
    ids=[x.get("id") for x in doc.xpath("//*[@id]")]
    for ident in sorted(set(ids)):
        if ids.count(ident)>1:err("id duplicado",ident)
    for image in doc.xpath("//img[not(@alt)]"):err("imagem sem alt",image.get("src",""))
    for frame in doc.xpath("//iframe[not(@title)]"):err("iframe sem title",frame.get("src",""))
    for button in doc.xpath("//button"):
        if not (" ".join(button.itertext()).strip() or button.get("aria-label") or button.get("aria-labelledby")):err("botão sem nome")
    for link in doc.xpath("//a[@href]"):
        if not (" ".join(link.itertext()).strip() or link.get("aria-label") or link.get("aria-labelledby")):err("link sem nome",link.get("href",""))
    labels={x.get("for") for x in doc.xpath("//label[@for]")}
    for control in doc.xpath("//input[not(@type='hidden')]|//select|//textarea"):
        parent_label=control.xpath("ancestor::label")
        named=parent_label or control.get("id") in labels or control.get("aria-label") or control.get("aria-labelledby")
        if not named:err("campo sem nome",control.get("id",control.tag))
    levels=[int(x.tag[1]) for x in doc.xpath("//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]")]
    for a,b in zip(levels,levels[1:]):
        if b>a+1:warnings.append(f"{path.relative_to(ROOT)}: salto de h{a} para h{b}")
print(f"Páginas: {len(pages)} | Erros: {len(errors)} | Avisos: {len(warnings)}")
for item in errors:print("ERRO",item)
for item in warnings:print("AVISO",item)
if errors:raise SystemExit(1)
