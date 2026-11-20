// Adaptative spaced repetition compatible with all v1-v3 saved review records.
export function nextReview(previous,grade,now=new Date()){
 if(!Number.isInteger(grade)||grade<0||grade>2)throw Error('Calificación inválida');
 const base=previous?.intervalDays||0;
 const lastEase=Number.isFinite(previous?.ease)?previous.ease:2.5;
 const ease=Math.max(1.3,Math.min(3,Math.round((lastEase+[ -.25,-.12,.05][grade])*100)/100));
 const intervalDays=grade===0?1:grade===1?(base<2?2:Math.min(90,Math.ceil(base*1.6))):(base<3?3:Math.min(180,Math.ceil(base*lastEase)));
 const at=now.toISOString();
 const history=(Array.isArray(previous?.history)?previous.history:[]).slice(-364);
 history.push({at,grade});
 return {intervalDays,dueAt:new Date(now.getTime()+intervalDays*86400000).toISOString(),lastReviewedAt:at,repetitions:(previous?.repetitions||0)+1,lastGrade:grade,ease,history};
}
export function due(memories,reviews,now=new Date()){
 const map=new Map(reviews.map(r=>[r.memoryId,r]));
 return memories.filter(m=>!map.has(m.id)||Date.parse(map.get(m.id).dueAt)<=now.getTime());
}
export function routeForRoom(roomId,links,memories){
 const selected=new Set(links.filter(l=>l.objectId.startsWith(roomId+'/')).map(l=>l.memoryId));
 return memories.filter(m=>selected.has(m.id)).sort((a,b)=>a.title.localeCompare(b.title,'es'));
}
export function learningStats(memories,reviews,now=new Date()){
 const today=now.toISOString().slice(0,10);
 const sessions=reviews.flatMap(r=>Array.isArray(r.history)?r.history:(r.lastReviewedAt?[{at:r.lastReviewedAt,grade:r.lastGrade}]:[]));
 const doneToday=sessions.filter(e=>e.at?.slice(0,10)===today).length;
 const successes=sessions.filter(e=>e.grade===2).length;
 const dates=new Set(sessions.map(e=>e.at?.slice(0,10)).filter(Boolean));
 let streak=0;const day=new Date(today+'T00:00:00Z');
 if(!dates.has(today))day.setUTCDate(day.getUTCDate()-1);
 while(dates.has(day.toISOString().slice(0,10))){streak++;day.setUTCDate(day.getUTCDate()-1);}
 return {due:due(memories,reviews,now).length,learned:reviews.length,doneToday,total:sessions.length,successRate:sessions.length?Math.round(100*successes/sessions.length):0,streak};
}
