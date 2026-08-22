from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]

for html in ROOT.rglob("*.html"):
    s=html.read_text(encoding="utf-8")
    prefix="../" if html.parent.name=="products" else ""
    tag=f'<script src="{prefix}assets/scripts/max-intelligence.js" defer></script>'
    if "max-intelligence.js" not in s and "max-decision.js" in s:
        needle=f'<script src="{prefix}assets/scripts/max-decision.js" defer></script>'
        s=s.replace(needle,needle+"\n"+tag)
    html.write_text(s,encoding="utf-8")

chat=ROOT/"assets/scripts/chatbot.js"
s=chat.read_text(encoding="utf-8")
if 'const MaxIntelligence = window.QualimaxMaxIntelligence' not in s:
    s=s.replace('const MaxDecision = window.QualimaxMaxDecision || null;', 'const MaxDecision = window.QualimaxMaxDecision || null;\n    const MaxIntelligence = window.QualimaxMaxIntelligence || null;')
marker='    const processarEntrada = (texto, mostrarUsuario = true) => {'
handler=r'''    const responderInteligenciaV337 = (termo) => {
        if (!MaxIntelligence || !estado.produtos.length) return false;
        const analise=MaxIntelligence.analisar(termo);

        if (analise.querResumo) {
            const partes=[];
            if (estado.preferencias.categoria) partes.push(`categoria ${estado.preferencias.categoria}`);
            if (estado.preferencias.tipo) partes.push(`formato ${estado.preferencias.tipo}`);
            if (estado.preferencias.vegana) partes.push("opções veganas");
            if (estado.preferencias.semGluten) partes.push("sem glúten");
            if (estado.preferencias.orcamento) partes.push(`até ${moeda(estado.preferencias.orcamento)}`);
            if (estado.produtosGostei.length) partes.push(`${estado.produtosGostei.length} produto(s) marcado(s) como gostei`);
            adicionarMensagem(partes.length ? `Meu entendimento atual é: ${partes.join(", ")}. Você pode corrigir qualquer critério.` : "Ainda não formei um perfil de busca. Diga um objetivo, orçamento ou restrição e eu organizo os próximos passos.");
            return true;
        }

        if (analise.querExplicacao && estado.ultimoLoteExibido?.length) {
            const base=MaxIntelligence.recomendar(estado.ultimoLoteExibido, {...analise,objetivos:analise.objetivos.length?analise.objetivos:estado.preferencias.termos||[],limite:3}, {gostei:estado.produtosGostei,naoGostei:estado.produtosNaoGostei});
            const linhas=base.map((x,i)=>`${i+1}. ${x.produto.nome}: ${x.motivos.length?x.motivos.join(", "):"afinidade geral com os filtros e o catálogo"}.`);
            adicionarMensagem(`Usei compatibilidade, restrições, preço e suas escolhas anteriores. ${linhas.join(" ")}`);
            return true;
        }

        if (/\b(?:esqueca|esqueça|remova|retire|nao considere)\b/.test(analise.texto)) {
            const removidos=[];
            if (/orcamento|preco|valor/.test(analise.texto)) { estado.preferencias.orcamento=null; removidos.push("orçamento"); }
            if (/formato|capsula|po|liquido/.test(analise.texto)) { estado.preferencias.tipo=""; estado.preferencias.excluirTipos=[]; removidos.push("formato"); }
            if (/vegano|vegana/.test(analise.texto)) { estado.preferencias.vegana=null; removidos.push("preferência vegana"); }
            if (/gluten/.test(analise.texto)) { estado.preferencias.semGluten=null; removidos.push("restrição de glúten"); }
            if (removidos.length) { adicionarMensagem(`Certo. Removi ${removidos.join(" e ")} da busca atual.`); return true; }
        }

        const mencionados=produtosMencionados(termo);
        if (analise.querComparar && mencionados.length>=2) {
            const dados=MaxIntelligence.comparar(mencionados);
            adicionarMensagem(dados.map((p,i)=>`${i+1}. ${p.nome}: ${precoTexto(mencionados[i])}; formato ${p.tipo}; ${p.vegana?"vegano":"característica vegana não informada"}; ${p.semGluten?"sem glúten":"informação de glúten não confirmada"}; destaques: ${p.beneficios.join(", ")||"consulte a descrição"}.`).join(" "));
            estado.ultimaComparacao=mencionados.slice(0,3);
            adicionarAcoes(mencionados.slice(0,3).map(p=>({texto:`Ver ${p.nome}`,acao:()=>explicarProduto(p)})));
            return true;
        }

        const temSinal=analise.objetivos.length || Number.isFinite(analise.orcamento) || Object.values(analise.restricoes).some(Boolean);
        if (temSinal && !/\b(?:curar|tratar|doenca|doença|medicamento|remedio|remédio|dose|posologia)\b/.test(analise.texto)) {
            const ranking=MaxIntelligence.recomendar(estado.produtos,analise,{gostei:estado.produtosGostei,naoGostei:estado.produtosNaoGostei});
            if (ranking.length) {
                const resumo=ranking.slice(0,3).map(x=>`${x.produto.nome} (${x.motivos.join(", ")||"boa afinidade"})`).join("; ");
                adicionarMensagem(`Cruzei os critérios da sua frase. As combinações mais fortes são: ${resumo}. Isso é orientação de catálogo, não recomendação médica.`);
                registrarResultados(ranking.map(x=>x.produto),"Ranking inteligente do Max");
                if (ranking.length>3) adicionarAcoes([{texto:"Mostrar mais",valor:"mostrar mais"},{texto:"Explicar critérios",valor:"por que você escolheu essas opções?"}]);
                return true;
            }
            adicionarMensagem(`Não encontrei uma combinação segura para todos os critérios ao mesmo tempo. ${MaxIntelligence.perguntaSeguinte(analise)}`);
            return true;
        }

        if (!mencionados.length && analise.texto.split(/\s+/).length<=5) {
            const aproximados=MaxIntelligence.encontrarAproximados(analise.texto,estado.produtos);
            if (aproximados[0]?.similaridade>=.62) {
                const melhor=aproximados[0].produto;
                adicionarMensagem(`Você quis dizer ${melhor.nome}?`);
                adicionarAcoes([{texto:`Sim, ${melhor.nome}`,acao:()=>explicarProduto(melhor)},{texto:"Não, buscar de outro jeito",valor:"quero refazer a busca"}]);
                return true;
            }
        }
        return false;
    };

'''
if 'const responderInteligenciaV337' not in s:
    s=s.replace(marker,handler+marker)
s=s.replace('        if (responderHorarioLocal(termo)) return;', '        if (responderHorarioLocal(termo)) return;\n        if (responderInteligenciaV337(termo)) return;')
chat.write_text(s,encoding="utf-8")

sw=ROOT/"service-worker.js"
s=sw.read_text(encoding="utf-8").replace("qualimax-v3.3.6","qualimax-v3.3.7")
if 'max-intelligence.js' not in s:
    s=s.replace('"./assets/scripts/max-decision.js",', '"./assets/scripts/max-decision.js", "./assets/scripts/max-intelligence.js",')
sw.write_text(s,encoding="utf-8")

for rel in ["README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","tools/test-fixes-v331.py","tools/test-v334.py","tools/test-v335.py","tools/audit-client.py"]:
    p=ROOT/rel
    if p.exists(): p.write_text(p.read_text(encoding="utf-8").replace("3.3.6","3.3.7"),encoding="utf-8")

security_test=ROOT/"tools/test-security-v336.py"
security_test.write_text(security_test.read_text(encoding="utf-8").replace("qualimax-v3.3.6","qualimax-v3.3.7"),encoding="utf-8")

admin=ROOT/"assets/scripts/admin.js"
admin.write_text(admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.6"','ADMIN_BACKUP_VERSION="3.3.7"'),encoding="utf-8")

changelog=ROOT/"docs/CHANGELOG.md"
entry='''## [3.3.7] — 2026-08-21\n\n### MAX Intelligence\n\n- compreensão simultânea de objetivo, orçamento e restrições;\n- tolerância a erros de digitação e confirmação de produto;\n- ranking explicável, diversificado e sensível às afinidades;\n- comparação objetiva de até três produtos;\n- resumo e correção seletiva da memória da conversa;\n- perguntas de esclarecimento orientadas pela incerteza;\n- linguagem responsável para orientação de catálogo.\n\n### Plataforma\n\n- nova camada de inteligência modular, offline e white-label;\n- cache e documentação atualizados;\n- testes unitários e regressivos específicos da v3.3.7.\n\n'''
cs=changelog.read_text(encoding="utf-8")
if "## [3.3.7]" not in cs: cs=cs.replace("## [3.3.6]",entry+"## [3.3.6]")
changelog.write_text(cs,encoding="utf-8")
