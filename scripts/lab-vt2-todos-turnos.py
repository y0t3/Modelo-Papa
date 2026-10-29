#!/usr/bin/env python3
"""LAB: complementariedad VT2 de las cinco franjas entre ganadoras del día,
presencia D-7 y (con continuidad de fuentes) D-1. No toca MV1 ni su ranking.
El JSON de entrada se reconstruye con lab-vt2-posiciones-libres.ts.
"""
import collections, datetime as dt, json, math, pathlib, random
from math import comb

src=pathlib.Path('auditorias/vt2-posiciones-libres/resultados.json')
data=json.loads(src.read_text())
T=['Previa','Primera','Matutino','Vespertino','Nocturno']
rows=data['rows']; dates=sorted({x['date'] for x in rows})
lookup={(x['date'],x['turn']):x for x in rows}; known=set(dates)
assert len(dates)==127 and len(rows)==635 and data['heads']==3401
assert data['baselineTop']=={'top3':220,'top5':351,'top10':674}
def old_date(date,n):return (dt.date.fromisoformat(date)-dt.timedelta(days=n)).isoformat()
def winners(row):return [x for x in row['heads'] if x['position'] is not None]
def score(row,choice):
 h=[x for x in winners(row) if x['family'] in choice]
 return {'families':len({x['family'] for x in h}),'heads':len(h)}
def pick(rank,groups):
 chosen=[]
 for group in groups:
  for family in rank:
   if family in group and family not in chosen:
    chosen.append(family)
    if len(chosen)==2:return chosen
 return chosen
def period(d):
 return 'JUN_JUL' if d<'2026-08-01' else ('AGO_SEP' if d<'2026-10-01'
         else 'OCT_1_24' if d<'2026-10-26' else 'OCT_26_28')
cuts=[]
for i,date in enumerate(dates):
 week=old_date(date,7);has_week=week in known
 prev=dates[i-1] if i else None
 sources=lookup[date,'Previa']['sourceDates']
 # No cruzar jornadas parciales y Nocturnas de distintas fechas como si
 # procedieran todas de la jornada anterior. No inventar resultados ausentes.
 has_prev=bool(prev and len(sources)==6 and all(v==prev for v in sources.values()))
 for k,turn in enumerate(T):
  row=lookup[date,turn];rank=row['rankedFamilies']
  today={h['family'] for t in T[:k] for h in winners(lookup[date,t])}
  weekly=set(lookup[week,turn]['rankedFamilies']) if has_week else set()
  previous=set(lookup[prev,turn]['rankedFamilies']) if has_prev else set()
  policies={
   'TOP2':pick(rank,[rank]),
   'HOY':pick(rank,[today,rank]),
   'D7':pick(rank,[weekly,rank]) if has_week else None,
   'HOY_D7':pick(rank,[today,weekly,rank]) if has_week else None,
   'D1':pick(rank,[previous,rank]) if has_prev else None,
   'HOY_D1':pick(rank,[today,previous,rank]) if has_prev else None,
  }
  result={p:score(row,x) if x is not None else None for p,x in policies.items()}
  cuts.append({'date':date,'turn':turn,'period':period(date),
   'weeklyDate':week if has_week else None,'previousDate':prev if has_prev else None,
   'rankedFamilies':rank,'wonEarlierToday':sorted(today),
   'weeklyFamilies':sorted(weekly) if has_week else None,
   'previousFamilies':sorted(previous) if has_prev else None,
   'selected':policies,'scores':result,
   'headResults':[{'family':h['family'],'jur':h['jur'],'head':h['head']} for h in winners(row)]})
from itertools import groupby
allp=['JUN_JUL','AGO_SEP','OCT_1_24','OCT_26_28','ALL']
summary={}
for turn in T:
 summary[turn]={}
 for period_name in allp:
  subset=[c for c in cuts if c['turn']==turn and
   (period_name=='ALL' or c['period']==period_name)]
  summary[turn][period_name]={}
  for p in ('TOP2','HOY','D7','HOY_D7','D1','HOY_D1'):
   eligible=[c for c in subset if c['scores'][p] is not None]
   if not eligible:continue
   summary[turn][period_name][p]={
    'cuts':len(eligible),
    'families':sum(c['scores'][p]['families'] for c in eligible),
    'heads':sum(c['scores'][p]['heads'] for c in eligible)}
assert len(cuts)==635
expected={'Previa':(29,29,22),'Primera':(19,24,29),'Matutino':(29,29,31),
          'Vespertino':(26,25,24),'Nocturno':(26,39,38)}
for turn,values in expected.items():
 subset=[c for c in cuts if c['turn']==turn and c['weeklyDate']]
 assert len(subset)==119,(turn,len(subset))
 for key,value in zip(('TOP2','HOY','HOY_D7'),values):
  got=sum(c['scores'][key]['families'] for c in subset)
  assert got==value,(turn,key,got,value)
# Test: shuffle exact weekly family masks among cuts of same month/weekday,
# holding current Top10, earlier-today winners and all current heads fixed.
rng=random.Random(20261029)
null={}
for turn in T:
 subset=[c for c in cuts if c['turn']==turn and c['weeklyDate']]
 groups=collections.defaultdict(list)
 for i,c in enumerate(subset):
  dow=dt.date.fromisoformat(c['date']).weekday()
  groups[(c['date'][:7],dow)].append(i)
 masks=[set(c['weeklyFamilies']) for c in subset]
 def value(arr):
  total=0
  for c,week_group in zip(subset,arr):
   chosen=pick(c['rankedFamilies'],[set(c['wonEarlierToday']),week_group,c['rankedFamilies']])
   total+=len({h['family'] for h in c['headResults'] if h['family'] in chosen})
  return total
 actual=value(masks); sims=[]
 for _ in range(12000):
  moved=masks[:]
  for idx in groups.values():
   items=[moved[i] for i in idx];rng.shuffle(items)
   for i,item in zip(idx,items):moved[i]=item
  sims.append(value(moved))
 sims.sort()
 null[turn]={'observed':actual,'randomAverage':sum(sims)/len(sims),
  'interval95':[sims[int(.025*len(sims))],sims[int(.975*len(sims))]],
  'pMoreWeekly':(1+sum(x>=actual for x in sims))/(1+len(sims)),
  'strata':len(groups),'singletonStrata':sum(len(v)==1 for v in groups.values())}
out={'type':'RETROSPECTIVE_PRE_REPLAY_NOT_SEALED',
 'days':127,'cuts':635,'heads':3401,
 'baseline':data['baselineTop'],'summary':summary,
 'weekReferenceControl':null,'cutsDetail':cuts,
 'limits':[
  'Heads and families are separate metrics: family counted at most once per turn.',
  'Historical winners from earlier turns only; never target turn POST in selection.',
  'Prior day is included only if all six previous Nocturna sources have that date.',
  'D-7 is the exact calendar date, not the previous available week date.',
  'No causation or predictive lift inferred, multiple exploratory comparisons.',
  'Same 2 family slots across policies; Lalo Top10 and Montevideo policy unchanged.'
 ]}
dst=pathlib.Path('auditorias/vt2-todos-turnos')
dst.mkdir(parents=True,exist_ok=True)
(dst/'resultados.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('VT2_TODOS_TURNOS_SUMMARY',json.dumps({
 'baseline':out['baseline'],
 'fiveTurns':{t:{p:summary[t]['ALL'][p] for p in ['TOP2','HOY','D7','HOY_D7','D1','HOY_D1']} for t in T},
 'null':null},ensure_ascii=False))
