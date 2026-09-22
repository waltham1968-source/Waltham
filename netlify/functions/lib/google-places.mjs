const host=value=>{try{return new URL(value).hostname.replace(/^www\./,'').toLowerCase();}catch{return null;}};

export function matchingPlace(places=[],siteUrl){
  const siteHost=host(siteUrl);
  if(!siteHost)return null;
  return places.find(place=>host(place.websiteUri)===siteHost) || null;
}

export async function googleReviews({name,siteUrl,key,fetcher=fetch}){
  if(!key || !name || !siteUrl)return null;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
  try{
    const response=await fetcher('https://places.googleapis.com/v1/places:searchText',{
      method:'POST',headers:{'content-type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.websiteUri,places.userRatingCount,places.rating,places.googleMapsUri'},
      body:JSON.stringify({textQuery:String(name).slice(0,120),maxResultCount:3}),signal:controller.signal
    });
    if(!response.ok)return null;
    const data=await response.json();const place=matchingPlace(data.places,siteUrl);
    if(!place || !Number.isInteger(place.userRatingCount))return null;
    return {count:place.userRatingCount,rating:Number.isFinite(place.rating)?place.rating:null,name:place.displayName?.text||name,url:place.googleMapsUri||null};
  }catch{return null;}finally{clearTimeout(timer);}
}
