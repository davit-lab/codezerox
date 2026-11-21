import type { CodeFiles } from './types';
import { photos } from './photos';
import { download, zipBytes } from './zip';
export const localAssetPaths=(text:string)=>text.replace(/(["'`])\/(photos|course-assets)\//g,'$1$2/').replace(/(url\(\s*)\/(photos|course-assets)\//g,'$1$2/');
export async function exportCodeProject(name:string,files:CodeFiles,title:string){
 const matches=[...new Set(Object.values(files).join('\n').match(/\/(?:photos\/[a-z-]+\.jpg|course-assets\/(?:branon|health)\/[A-Za-z0-9_-]+\.(?:jpg|png))/g)??[])];
 const assets:Record<string,string|Uint8Array>={};
 for(const path of matches){const response=await fetch(path);if(!response.ok)throw new Error('ფოტო ვერ ჩაიტვირთა: '+path);assets[path.slice(1)]=new Uint8Array(await response.arrayBuffer());}
 const local=localAssetPaths;
 const safeTitle=title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const html=`<!doctype html>\n<html lang="ka"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle}</title><link rel="stylesheet" href="styles.css"></head><body>\n${local(files.html)}\n<script src="main.js"></script></body></html>`;
 const sourceNote=matches.some(path=>path.startsWith('/course-assets/'))?'\n\nგამოყენებულია მომხმარებლის მიერ მოწოდებული 248608.zip ან 2098_health.zip არქივის ფოტოები. Health-ის ვიზუალური საფუძველი: Tooplate 2098 Health. მასალებზე ვრცელდება ორიგინალი ავტორების პირობები. ეს არქივი შეიცავს მოსწავლის კოდს და მისთვის საჭირო ფოტოებს; ორიგინალი შაბლონების სრული პაკეტები არ ერთვის.':'';
 const credits=photos.filter(photo=>matches.includes(photo.path)).map(photo=>`${photo.credit} — ${photo.source}\n${photo.license}: ${photo.licenseUrl}`).join('\n\n');
 const readme=`# ${title}\n\nსასწავლო პროექტი: გახსენი index.html. ფოტოები არქივშია და გარე ჰოსტზე დამოკიდებული არ არის.\n\nlocalStorage-ის სტაბილურად შესამოწმებლად გახსენი პროექტი ადგილობრივი სერვერით: ამ საქაღალდეში გაუშვი python3 -m http.server 8000 და ბრაუზერში გახსენი http://localhost:8000. file: მისამართზე შენახვის ქცევა ბრაუზერებს შორის განსხვავდება.\n\nფორმები, კალათა და დაჯავშნა დემოა: მონაცემები არ იგზავნება, გადახდა და ნამდვილი ჯავშანი არ იქმნება.\n\n## GitHub Pages-ზე გამოქვეყნება\n\n1. შექმენი საჯარო GitHub რეპოზიტორია და ატვირთე ZIP-ის გაშლილი ფაილები. index.html რეპოზიტორიის ზედა საქაღალდეში დატოვე.\n2. გახსენი **Settings → Pages**.\n3. **Build and deployment**-ში აირჩიე **Deploy from a branch**, შემდეგ main და /(root), ბოლოს დააჭირე **Save**.\n4. Pages-ის სტატუსის გამოჩენის შემდეგ გახსენი **Visit site**. პირველი გამოქვეყნება შეიძლება რამდენიმე წუთს გაგრძელდეს.\n\nGitHub Pages-ის საიტი საჯაროდ გამოჩნდება ინტერნეტში. უფასო GitHub ანგარიშისთვის Pages საჯარო რეპოზიტორიაში გამოიყენე. ეს სტატიკური პროექტია: საკონტაქტო ფორმა, კალათა და დაჯავშნა რეალურ მონაცემებს არ აგზავნის. ოფიციალური ნაბიჯები: https://docs.github.com/en/pages/quickstart.\n\n## ფოტოები\n\n${credits||'ფოტოები მოწოდებული პროექტის მასალებიდანაა.'}${sourceNote}\n\nგამოსახულ პირებს სასწავლო ბრენდთან კავშირი არ მიეწერებათ.\n`;
 const archive=zipBytes({'index.html':html,'styles.css':local(files.css),'main.js':local(files.js),'README.md':readme,...assets});
 download(name+'.zip',archive as BlobPart,'application/zip');
}
