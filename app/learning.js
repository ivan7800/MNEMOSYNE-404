// Algoritmo de intervalos sencillos y deterministas (no pretende implementar SM-2).
export function nextReview(previous,grade,now=new Date()){
 if(!Number.isInteger(grade)||grade<0||grade>2)throw new Error('Calificación inválida');
 const prev=previous?.intervalDays||0;
 const intervalDays=grade===0?1:grade===1?(prev<2?2:Math.min(90,Math.ceil(prev*1.6))):(prev<3?3:Math.min(180,Math.ceil(prev*2.5)));
 const date=new Date(now.getTime()+intervalDays*86400000);
 return {intervalDays,dueAt:date.toISOString(),lastReviewedAt:now.toISOString(),repetitions:(previous?.repetitions||0)+1,lastGrade:grade};
}
export function due(memories,reviews,now=new Date()){
 const map=new Map(reviews.map(r=>[r.memoryId,r]));return memories.filter(m=>!map.has(m.id)||Date.parse(map.get(m.id).dueAt)<=now.getTime());
}
export function routeForRoom(roomId,links,memories){const selected=new Set(links.filter(l=>l.objectId.startsWith(roomId+'/')).map(l=>l.memoryId));return memories.filter(m=>selected.has(m.id)).sort((a,b)=>a.title.localeCompare(b.title,'es'));}
