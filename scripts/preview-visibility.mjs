import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import handler from '../netlify/functions/ai-visibility.mjs';
const root=path.resolve(new URL('..',import.meta.url).pathname);
http.createServer(async(req,res)=>{
 try{
  if(req.url==='/api/ai-visibility'){
   let body='';for await(const chunk of req){body+=chunk;if(body.length>6000){res.writeHead(413);res.end();return;}}
   const result=await handler(new Request('http://localhost/api/ai-visibility',{method:req.method,body:['GET','HEAD'].includes(req.method)?undefined:body}));res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
  }
  let target=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(target.endsWith('/'))target+='index.html';if(!path.extname(target))target+='.html';
  const filename=path.resolve(root,'.'+target);if(!filename.startsWith(root+path.sep)||target.includes('/.')){res.writeHead(403);res.end();return;}
  const data=await readFile(filename);const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg'}[path.extname(filename)]||'application/octet-stream';res.writeHead(200,{'content-type':mime});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173/dk/ai-visibility-check'));
