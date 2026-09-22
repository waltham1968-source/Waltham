import test from 'node:test';
import assert from 'node:assert/strict';
import {matchingPlace,googleReviews} from '../netlify/functions/lib/google-places.mjs';

test('review counts require a website match, not merely a similar name',async()=>{
  const places=[{displayName:{text:'Example'},websiteUri:'https://unrelated.test',userRatingCount:900},{displayName:{text:'Example AS'},websiteUri:'https://www.example.com/',userRatingCount:12,rating:4.3,googleMapsUri:'https://maps.google.com/?cid=1'}];
  assert.equal(matchingPlace(places,'https://example.com/').userRatingCount,12);
  const fetcher=async()=>({ok:true,json:async()=>({places})});
  assert.deepEqual(await googleReviews({name:'Example',siteUrl:'https://example.com',key:'test',fetcher}),{count:12,rating:4.3,name:'Example AS',url:'https://maps.google.com/?cid=1'});
  assert.equal(await googleReviews({name:'Example',siteUrl:'https://other.test',key:'test',fetcher}),null);
  assert.equal(await googleReviews({name:'Example',siteUrl:'https://example.com',key:'',fetcher}),null);
});
