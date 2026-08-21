#!/usr/bin/env python3
"""Cria um ZIP estático pronto para GitHub Pages ou Netlify."""
import argparse, shutil, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--saida',default='saude-qualimax-publicacao');a=p.parse_args()
root=Path(__file__).resolve().parents[1];saida=(root/a.saida).resolve()
subprocess.run(['python3','tools/audit-client.py'],cwd=root,check=True)
arquivo=shutil.make_archive(str(saida),'zip',root)
print(arquivo)
