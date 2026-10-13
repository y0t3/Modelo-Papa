import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

out = Path('auditorias/vt3-nocturna-12oct2026')
sealed = json.loads((out/'NOCTURNA_PRE_SELLADO.json').read_text())
diag = json.loads((out/'DIAGNOSTICO_VT3.json').read_text())
panels = [('851','Primera'),('615','Primera'),('615','Vespertino'),('242','Vespertino')]
fig, axes = plt.subplots(1,4,figsize=(14,6.8))
fig.patch.set_facecolor('#f5f6fa')
labels=['Ciudad','Provincia','Córdoba','Santa Fe','Entre Ríos','Montevideo']
for ax,(value,source) in zip(axes,panels):
    item=next(d for d in diag['details'] if d['value']==value)
    col=next(c for c in sealed['sourceColumns'] if c['id']==source)
    unique={}
    for route in item['physical']:
        if route['source']!=source: continue
        coords=tuple((c['row'],c['col']) for c in route['path'])
        key=min(coords,coords[::-1])
        unique[key]=route
    used=set()
    for key,route in unique.items():
        coords=[(c['row'],c['col']) for c in route['path']]
        used.update(coords)
        color='#14805e' if route['enginePath'] else '#cc6500'
        xs=[c for r,c in coords];ys=[r for r,c in coords]
        ax.plot(xs,ys,color=color,linewidth=4,linestyle='-' if route['enginePath'] else '--',alpha=.85,zorder=3)
    for r,v in enumerate(col['values']):
        for c in range(2):
            ax.add_patch(Rectangle((c-.43,r-.43),.86,.86,facecolor='#ffffff',edgecolor='#d7dce5',zorder=1))
            ax.text(c,r,v[c] if v!='--' else '–',ha='center',va='center',fontsize=20,fontweight='bold',color='#172b46',bbox=dict(boxstyle='circle,pad=.10',fc='white',ec='none'),zorder=4)
        ax.text(-.62,r,labels[r],ha='right',va='center',fontsize=9,color='#566477')
    rank=item['sealedRank']
    ax.set_title(f'{value} · fuente {source}\n'+(f'Familia en puesto {rank}/61' if rank else 'Familia fuera de la bolsa'),fontsize=12,fontweight='bold',loc='center',pad=18)
    ax.set_xlim(-1.9,1.65);ax.set_ylim(5.7,-.65);ax.set_aspect('equal');ax.axis('off')
fig.suptitle('Nocturna 12/10 · recorridos que ya existían en el tablero PRE',x=.5,y=.98,fontsize=17,fontweight='bold',color='#172b46')
fig.text(.5,.89,'Cada panel conserva las seis filas y las dos casillas de su fuente. Ningún camino cruza de turno.',ha='center',fontsize=11,color='#566477')
fig.text(.5,.09,'VERDE CONTINUO: admitido por el motor     |     NARANJA DISCONTINUO: válido en la hoja, excluido del motor',ha='center',fontsize=11,color='#172b46')
fig.text(.5,.045,'Diagnóstico posterior al sorteo sobre el sello original de las 18:56. Se muestran todos los trazados de estas lecturas, sin duplicar reversos.',ha='center',fontsize=9,color='#566477')
fig.subplots_adjust(top=.78,bottom=.16,left=.02,right=.99,wspace=.12)
fig.savefig(out/'RECORRIDOS_VT3.png',dpi=150,facecolor=fig.get_facecolor())
fig.savefig(out/'RECORRIDOS_VT3.svg',facecolor=fig.get_facecolor())
