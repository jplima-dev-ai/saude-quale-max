#!/usr/bin/env python3
"""Gera uma cópia white-label a partir de config/produtos e executa validações."""
import argparse, shutil, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--destino',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1];dest=Path(a.destino).resolve()
if dest.exists(): raise SystemExit('Destino já existe; escolha uma pasta nova.')
shutil.copytree(root,dest,ignore=shutil.ignore_patterns('.git','__pycache__','*.zip'))
subprocess.run(['python3','tools/sync-client.py'],cwd=dest,check=True)
subprocess.run(['python3','tools/audit-client.py'],cwd=dest,check=True)
print(dest)
