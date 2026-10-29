#!/usr/bin/env python3
"""PRE reconstruido VT2 Lalo: cruce de ganadoras de hoy con D-7.
No modifica MV1, APK, rankings ni PRE sellados.
Consume resultados.json generado por lab-vt2-posiciones-libres.ts.
"""
import collections, datetime as dt, json, pathlib
source=pathlib.Path('auditorias/vt2-posiciones-libres/resultados.json')
data=json.loads(source.read_text())
rows=data['rows'];get={(r['date'],r['turn']):r for r in rows}
dates=sorted(set(r['date'] for r in rows))
assert len(dates)==127 and len(rows)==635 and data['heads']==3401
assert data['baselineTop']=={'top3':220,'top5':351,'top10':674}
TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno']
def winners(r):
 return [h for h in r['heads'] if h['position'] is not None]
def pick(*groups):
 positions=[]
 for group in groups:
  for pos in group:
   if pos not in positions:positions.append(pos)
   if len(positions)==2:return positions
 return positions
def period(d):
 return ('JUN_JUL' if d<'2026-08-01' else 'AGO_SEP' if d<'2026-10-01'
         else 'OCT_1_24' if d<'2026-10-26' else 'OCT_26_28')
details=[]
for date in dates:
 week=str(dt.date.fromisoformat(date)-dt.timedelta(days=7))
 if week not in dates:continue
 for turn,older in [('Primera',['Previa']),('Nocturno',TURNOS[:4])]:
  cur=get[(date,turn)];last=get[(week,turn)];fs=cur['rankedFamilies']
  assert len(fs)==10
  prior={h['family'] for t in older for h in winners(get[(date,t)])}
  weekly=set(last['rankedFamilies'])
  D=[i+1 for i,f in enumerate(fs) if f in prior]
  W=[i+1 for i,f in enumerate(fs) if f in weekly]
  BOTH=[p for p in D if p in W]
  policies={
    'TOP2':[1,2],
    'GANO_HOY':pick(D,range(1,11)),
    'D7_PRESENTE':pick(W,range(1,11)),
    'DOBLE_Y_TOP':pick(BOTH,range(1,11)),
    'HOY_LUEGO_D7':pick(D,W,range(1,11)),
    'DOBLE_HOY_D7':pick(BOTH,D,W,range(1,11)),
  }
  actual=winners(cur)
  observations={key:{
    'heads':sum(h['position'] in ranks for h in actual),
    'families':len({h['family'] for h in actual if h['position'] in ranks}),
    'daysHit':int(any(h['position'] in ranks for h in actual)),
    } for key,ranks in policies.items()}
  details.append({'date':date,'date7':week,'turn':turn,'period':period(date),
   'top10Hits':len(actual),'dayMarked':D,'weeklyMarked':W,
   'doubleMarked':BOTH,'doubleHitHeads':sum(h['position'] in BOTH for h in actual),
   'policies':policies,'observations':observations})
assert len(details)==238 and len(set(x['date'] for x in details))==119
out={}
for turn in ['Primera','Nocturno']:
 subset=[x for x in details if x['turn']==turn]
 out[turn]={}
 for p in ['JUN_JUL','AGO_SEP','OCT_1_24','OCT_26_28','ALL']:
  cur=[x for x in subset if p=='ALL' or x['period']==p]
  result={'cuts':len(cur),'top10HitHeads':sum(x['top10Hits'] for x in cur),
   'doubleMarkedSlots':sum(len(x['doubleMarked']) for x in cur),
   'doubleHitHeads':sum(x['doubleHitHeads'] for x in cur),
   'policies':{}}
  for policy in subset[0]['policies']:
   result['policies'][policy]={
    'heads':sum(x['observations'][policy]['heads'] for x in cur),
    'families':sum(x['observations'][policy]['families'] for x in cur),
    'daysHit':sum(x['observations'][policy]['daysHit'] for x in cur)}
  out[turn][p]=result
first=out['Primera']['ALL'];night=out['Nocturno']['ALL']
assert (first['doubleMarkedSlots'],first['doubleHitHeads'])==(11,1)
assert (night['doubleMarkedSlots'],night['doubleHitHeads'])==(56,10)
assert [first['policies'][p]['families'] for p in
        ['TOP2','GANO_HOY','D7_PRESENTE','HOY_LUEGO_D7']]==[19,24,24,29]
assert [night['policies'][p]['families'] for p in
        ['TOP2','GANO_HOY','D7_PRESENTE','HOY_LUEGO_D7']]==[26,39,31,38]
result={'kind':'RETROSPECTIVE_PRE_RECONSTRUCTED_NOT_SEALED',
 'cuts':len(details),'pairedDates':len(set(x['date'] for x in details)),
 'results':out,'details':details,
 'caveats':['Two reversible VT2 families selected from official Top10, never new numbers.',
 'A winning family is counted once per cut even when multiple jurisdiction heads matched.',
 'No target head influences any PRE state; only prior published heads and D-7 earlier date.',
 'No projection or requirement of identical physical path across days, only reversible family membership.',
 'Missing D-7 archived dates excluded, not imputed. Feriados parciales are not invented.',
 'Post-hoc multiple hypotheses: no validated lottery or economic advantage.']}
dest=pathlib.Path('auditorias/vt2-cruce-previa-semana')
dest.mkdir(parents=True,exist_ok=True)
(dest/'resultados.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('VT2_CRUCE_DOS_SENALES',json.dumps({'pairedDates':result['pairedDates'],
 'primera':first,'nocturna':night},ensure_ascii=False))
