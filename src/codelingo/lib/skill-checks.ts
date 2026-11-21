import type {Check,CodeFiles} from './types';
const expression=(label:string,expression:string):Check=>({label,expression});
const rule=(selector:string,property:string)=>`[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r.selectorText===${JSON.stringify(selector)}).map(r=>r.style.getPropertyValue(${JSON.stringify(property)})).filter(Boolean).at(-1)`;
export function strongerChecks(id:number):Check[]{switch(id){
case 1:return [expression('თითოეულ კითხვას საკუთარი სათაური და პასუხი აქვს',"[...document.querySelectorAll('details')].every(d=>d.firstElementChild?.tagName==='SUMMARY'&&d.querySelector('summary').textContent.trim()&&d.querySelector('p')?.textContent.trim())")];
case 2:return [expression('ორივე ველი თავის label-ს უკავშირდება',"[...document.querySelectorAll('fieldset input')].length===2&&[...document.querySelectorAll('fieldset input')].every(x=>x.labels.length>0)")];
case 3:return [expression('ორივე რიგში ორი მონაცემის უჯრაა',"[...document.querySelectorAll('tbody tr')].length===2&&[...document.querySelectorAll('tbody tr')].every(r=>r.querySelectorAll('td').length===2)")];
case 4:return [expression('რიცხვები და ხილული ტექსტი ზუსტია',"document.querySelector('progress').value===3&&document.querySelector('progress').max===10&&[...document.querySelectorAll('p')].some(p=>p.textContent.includes('3 / 10'))")];
case 5:return [expression('ორივე ზომა დადებითია და alt აღწერითია',"(()=>{const img=document.querySelector('figure img');return Number(img.getAttribute('width'))>0&&Number(img.getAttribute('height'))>0&&img.alt.trim().length>=12})()")];
case 6:return [expression('რიცხვით ველს სწორი საზღვრები და სავალდებულოობა აქვს',"(()=>{const input=document.querySelector('input[type=number]');return input?.required&&input.min==='1'&&input.max==='8'})()")];
case 7:return [expression('ავტომატური სვეტები ნამდვილად აღწერილია',`(()=>{const value=${rule('.cards','grid-template-columns')};return !!value&&value.includes('auto-fit')&&value.includes('minmax')})()`)];
case 8:return [{label:'მეზობლებს შორის ზუსტად 12px-ია',selector:'nav',property:'gap',values:['12px']}];
case 9:return [];
case 10:return [expression('ფოკუსს მკაფიო ხაზი და დაშორება აქვს',`(()=>{const rules=[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r.selectorText==='button:focus-visible');return rules.some(r=>r.style.outlineWidth==='3px'&&r.style.outlineStyle==='solid'&&r.style.outlineOffset==='4px')})()`)];
case 11:return [expression('ზომის ფორმულა და ტექსტის სიგრძე განსაზღვრულია',`(()=>{const size=${rule('h1','font-size')};const width=${rule('p','max-width')};return !!size&&/^clamp\\(\\s*32px\\s*,\\s*5vw\\s*,\\s*64px\\s*\\)$/.test(size)&&width==='60ch'&&Math.abs(parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight)/parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)-1.2)<0.02})()`)];
case 12:return [expression('ბეჭდვის წესები საჭირო მოქმედებებს ასრულებს',"(()=>{const rules=[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r.conditionText==='print').flatMap(r=>[...r.cssRules]);const hides=selector=>rules.some(r=>r.selectorText?.split(',').map(x=>x.trim()).includes(selector)&&r.style.display==='none');return hides('nav')&&hides('button')&&rules.some(r=>r.selectorText==='article'&&r.style.breakInside==='avoid')})()")];
case 13:return [expression('გამოტოვებები და დიდი ასოებიც მუშავდება',"(()=>{const input=document.querySelector('#search');input.value='  HTML  ';input.dispatchEvent(new Event('input',{bubbles:true}));return !document.querySelectorAll('.item')[0].hidden&&document.querySelectorAll('.item')[1].hidden})()")];
case 14:return [expression('წილადები და უარყოფითი რიცხვებიც იკრიბება','total([1.5,-2,4.5])===4')];
case 15:return [{label:'მეორე ღილაკიც საკუთარ id-ს აჩვენებს',selector:'#selected',contains:'two',action:{selector:'button[data-id="two"]',event:'click'}}];
case 16:return [expression('მხოლოდ გამოტოვებები უარყოფილია',"(()=>{const input=document.querySelector('input');input.value='   ';document.querySelector('#form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return document.querySelector('#result').textContent.includes('შეავსე')})()")];
case 17:return [expression('საცავის შეცდომა კონტროლდება',"(()=>{const original=localStorage.setItem;try{localStorage.setItem=()=>{throw Error('blocked')};document.querySelector('#save').click();return document.querySelector('#status').textContent.includes('მიუწვდომელია')}finally{localStorage.setItem=original}})()")];
case 18:return [expression('საზღვრები მიღებულია, არასწორი ტიპები უარყოფილია',"validSettings({theme:'dark',fontSize:14})===true&&validSettings({theme:'light',fontSize:24})===true&&validSettings({theme:'blue',fontSize:18})===false&&validSettings({theme:'light',fontSize:'18'})===false&&validSettings({theme:'light',fontSize:18.5})===false&&validSettings({theme:'light',fontSize:13})===false")];
default:return [];
}}
export function brokenSkill(id:number,files:CodeFiles):CodeFiles{
 const broken={...files};
 const mutations:Record<number,[keyof CodeFiles,string,string]>={1:['html','<summary>','<div>'],2:['html','<label>','<div>'],3:['html','scope="col"','scope="row"'],4:['html','value="3"','value="13"'],5:['html','width="908"','width="0"'],6:['html','max="8"','max="9"'],7:['css','display:grid','display:block'],8:['css','gap:12px','gap:1px'],9:['css','aspect-ratio:16/9','aspect-ratio:1/1'],10:['css','outline:3px','outline:1px'],11:['css','clamp(32px,5vw,64px)','40px'],12:['css','display:none','display:block']};
 const mutation=mutations[id];if(mutation)broken[mutation[0]]=broken[mutation[0]].replace(mutation[1],mutation[2]);else broken.js='// მოვლენის ან ფუნქციის განხორციელება აკლია.';
 return broken;
}
