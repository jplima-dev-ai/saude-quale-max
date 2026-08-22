#!/usr/bin/env python3
"""Regressões das correções específicas da versão 3.3.1."""
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def exigir(condicao: bool, mensagem: str) -> None:
    if not condicao:
        raise AssertionError(mensagem)


def main() -> None:
    pwa = (ROOT / "assets" / "scripts" / "pwa.js").read_text(encoding="utf-8")
    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    admin = (ROOT / "admin.html").read_text(encoding="utf-8")
    admin_js = (ROOT / "assets" / "scripts" / "admin.js").read_text(encoding="utf-8")

    exigir('fetch(`${raiz}data/config.json`' in pwa,
           "A PWA deve buscar a configuração relativamente à raiz calculada da página.")
    exigir('if (promessaConfig) return promessaConfig;' in pwa,
           "A configuração da PWA deve reutilizar a mesma promessa.")
    exigir('const CACHE = "qualimax-v3.5.9";' in sw,
           "O cache precisa estar renovado na versão atual.")
    exigir('return cached || response;' in sw,
           "JSON com resposta HTTP inválida deve permitir fallback para o cache.")
    exigir('for="admin-upload-imagem"' in admin and 'id="admin-upload-imagem"' in admin,
           "O seletor de imagem do Admin precisa de rótulo associado.")
    exigir('ADMIN_BACKUP_VERSION="3.5.9"' in admin_js,
           "O backup do Admin deve informar a versão atual.")
    print("CORRECOES_BASE_TESTS_OK")


if __name__ == "__main__":
    main()
