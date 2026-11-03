import {test} from 'node:test';import assert from 'node:assert/strict';
import {defaultParams,emptyOrder,calculate,orderSchema,paramsSchema,sortOrders,isFullyPaid,isArchived} from '../src/model.ts';
import {createStore,KEY} from '../src/store.ts';import {paramsFromRows,ordersFromRows,parseResponse} from '../src/sheet.ts';
const order=(o={})=>({...emptyOrder(defaultParams()),name:'Cliente',product:'Pieza',...o});
const disk=()=>{const d=new Map();return {getItem:k=>d.get(k)||null,setItem:(k,v)=>d.set(k,v)};};
test('all production costs multiply by units, including depreciation',()=>{const n=calculate(order({quantity:2,filament:'PLA+',weight:121,hours:4,quotedTotal:60000}));assert.equal(n.totalCost,51760);assert.equal(n.profit,8240);assert.equal(n.suggested,129400);assert.equal(n.balance,60000);});
test('seven units do not accidentally subtract only one unit of cost',()=>{const n=calculate(order({quantity:7,filament:'PLA',weight:18.51,hours:1,quotedTotal:46200}));assert.equal(n.totalCost,32253);assert.equal(n.profit,13947);assert.ok(n.suggested>n.totalCost);});
test('suggested price includes depreciation, margin and rounding upward',()=>{const o=order({weight:400,hours:15,filament:'PETG',quotedTotal:400000});const n=calculate(o);assert.equal(n.totalCost,87795);assert.equal(n.profit,312205);assert.equal(n.suggested%100,0);assert.ok(n.suggestedProfit/n.suggested>=.6);});
test('extra cost is per order; selling price overrides only the sale and profit',()=>{const o=order({quantity:2,weight:100,extraCost:5000,quotedTotal:10000});const n=calculate(o);assert.equal(n.totalCost,29000);assert.equal(n.profit,-19000);assert.notEqual(n.suggested,n.saleTotal);});
test('overpayments and invalid margin are rejected; zero quote stays zero',()=>{assert.equal(orderSchema.safeParse(order({quotedTotal:100,initialPaid:101})).success,false);assert.equal(paramsSchema.safeParse({...defaultParams(),margin:1}).success,false);assert.equal(calculate(order({weight:10,quotedTotal:0})).saleTotal,0);});
test('saved orders preserve their cost snapshot when global parameters change',()=>{const store=createStore(disk()),o=order({weight:100});store.saveOrder(o);store.saveParams({...defaultParams(),kwh:5000},0);const saved=store.read().orders[0];assert.equal(saved.pricing.kwh,1000);assert.equal(store.read().params.kwh,5000);});
test('imports are atomic and duplicate IDs are skipped; stale saves rejected',()=>{const store=createStore(disk()),o=order();assert.equal(store.import({orders:[o,o]}).added,1);const saved=store.read().orders[0];store.saveOrder({...saved,notes:'Nuevo'});assert.throws(()=>store.saveOrder({...saved,notes:'Viejo'}),/otra pestaña/);assert.throws(()=>store.import({orders:[order(),order({quantity:0})]}));assert.equal(store.read().orders.length,1);});
test('storage failures and corrupt data are reported without pretending success',()=>{const d=disk(),store=createStore(d);d.setItem(KEY,'{');assert.throws(()=>store.read());d.setItem(KEY,JSON.stringify({version:1,params:defaultParams(),orders:[]}));d.setItem=()=>{throw Error('quota')};assert.throws(()=>store.saveOrder(order()),/No se pudo guardar/);});
test('numeric source margin remains 60 percent, delivered status wins over phase',()=>{const pRows=[['PLA',120000,120,null,'Valor kWh actual',1000],['PLA+',135000,135,null,'Consumo impresora 3D (kWh/h)',.4],['PETG',130000,130,null,'Margen de ganancia sugerido',.6],[null,null,null,null,'Valor máquina (COP)',5800000],[null,null,null,null,'Vida útil (horas: 1 año x 8h/día)',2920]];const p=paramsFromRows(pRows);assert.equal(p.margin,.6);const imported=ordersFromRows([['Cliente','Pieza',1,'Impreso',null,'Entregado','PLA',20,1,null,null,null,null,null,30000,null,0]],p);assert.equal(imported[0].phase,'Entregado');assert.equal(imported[0].status,'Entregado');});
test('source response parser reads values safely; automatic order puts corrections first',()=>{assert.deepEqual(parseResponse('/*test*/google.visualization.Query.setResponse({"status":"ok","table":{"rows":[{"c":[{"v":0.6}]}]}});'),[[.6]]);const rows=[order({id:'done',status:'Entregado'}),order({id:'fix',status:'Correcciones'}),order({id:'print',phase:'Imprimiendo'})];assert.deepEqual(sortOrders(rows,'auto').map(o=>o.id),['fix','print','done']);});
test('full initial payment or accumulated installments automatically archive; partial payment stays active',()=>{
 const base=order({quotedTotal:100000,initialPaid:25000});
 assert.equal(isArchived(base),false);
 assert.equal(isArchived({...base,initialPaid:100000}),true);
 const paid={...base,payments:[{id:'a',amount:30000,date:'2026-11-03',note:''},{id:'b',amount:45000,date:'2026-11-03',note:''}]};
 assert.equal(isFullyPaid(paid),true);assert.equal(isArchived(paid),true);
 assert.equal(isArchived({...paid,payments:paid.payments.slice(0,1)}),false);
 assert.equal(isArchived({...base,archived:true}),true);
});
test('unpriced drafts, free orders and delivered orders with unpaid balances stay active',()=>{
 assert.equal(isFullyPaid(order()),false);
 assert.equal(isArchived(order({weight:100,quotedTotal:0})),false);
 assert.equal(isArchived(order({status:'Entregado',quotedTotal:50000,initialPaid:49999})),false);
 const suggested=order({weight:100});assert.equal(isArchived({...suggested,initialPaid:calculate(suggested).suggested}),true);
});
test('paid imports and legacy saved records archive without changing data; payment corrections persist',()=>{
 const d=disk(),store=createStore(d),paid=order({quotedTotal:60000,initialPaid:10000,payments:[{id:'paid',amount:50000,date:'2026-11-03',note:'Final'}]});
 store.import({orders:[paid]});const saved=store.read().orders[0];
 assert.equal(saved.archived,false);assert.equal(isArchived(saved),true);assert.equal(saved.payments[0].note,'Final');
 store.saveOrder({...saved,initialPaid:0});assert.equal(isArchived(createStore(d).read().orders[0]),false);
});
