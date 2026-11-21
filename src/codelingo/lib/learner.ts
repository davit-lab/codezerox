import type {Progress} from './types';
export const avatarOptions={
 skin:[['sand','ღია','#f5cfb3'],['peach','ატმისფერი','#e7b28c'],['tan','ხორბლისფერი','#c28b63'],['brown','ყავისფერი','#966345'],['deep','მუქი','#68432f'],['rose','ვარდისფერი','#eac1b3']],
 hair:[['crop','მოკლე'],['sweep','გვერდზე გადავარცხნილი'],['curls','ხვეული'],['bob','კარე'],['long','გრძელი'],['bun','შეკრული'],['spikes','აწეული'],['none','უთმო']],
 hairColor:[['espresso','მუქი ყავისფერი','#3c302c'],['black','შავი','#222827'],['chestnut','წაბლისფერი','#805035'],['copper','სპილენძისფერი','#b96c42'],['blond','ქერა','#d8b86c'],['silver','ვერცხლისფერი','#abb4b4']],
 eyes:[['round','მრგვალი'],['almond','ნუშისებრი'],['bright','დიდი'],['smile','მომღიმარი'],['calm','მშვიდი'],['lashes','წამწამებით']],
 face:[['oval','ოვალური'],['round','მრგვალი'],['square','კუთხოვანი'],['soft','მოგრძო']],
 mouth:[['smile','ღიმილი'],['grin','ფართო ღიმილი'],['calm','მშვიდი'],['open','სიხარული']],
 shirt:[['leaf','მწვანე','#598e43'],['navy','მუქი ლურჯი','#344e64'],['clay','აგურისფერი','#b16a50'],['cream','კრემისფერი','#d7c9a3'],['berry','ალუბლისფერი','#945466'],['slate','ნაცრისფერი','#707b7d']],
 background:[['paper','ქაღალდი','#f4f3ed'],['sage','სალბისფერი','#e0e9d8'],['sand','ქვიშისფერი','#efe2c9'],['sky','ცისფერი','#dce7ed'],['rose','ვარდისფერი','#eedcda']],
 accessory:[['none','აქსესუარის გარეშე'],['glasses','მრგვალი სათვალე'],['square','მართკუთხა სათვალე'],['freckles','ჭორფლები'],['earrings','საყურეები']]
} as const;
export type AvatarPart=keyof typeof avatarOptions;
export type AvatarConfig={ [P in AvatarPart]: (typeof avatarOptions)[P][number][0] };
export type Learner={age:number|null;gender:'male'|'female'|'nonbinary'|'unspecified';avatar:AvatarConfig;coachTips:boolean;plainLanguage:boolean;introVersion:1};
export const defaultAvatar=():AvatarConfig=>({skin:'peach',hair:'sweep',hairColor:'espresso',eyes:'round',face:'oval',mouth:'smile',shirt:'leaf',background:'sage',accessory:'none'});
export const defaultLearner=():Learner=>({age:null,gender:'unspecified',avatar:defaultAvatar(),coachTips:true,plainLanguage:true,introVersion:1});
export function validAvatar(value:unknown):value is AvatarConfig{if(!value||typeof value!=='object'||Array.isArray(value))return false;const row=value as Record<string,unknown>;return Object.keys(row).length===Object.keys(avatarOptions).length&&(Object.keys(avatarOptions) as AvatarPart[]).every(part=>avatarOptions[part].some(option=>option[0]===row[part]));}
export function validLearner(value:unknown):value is Learner{if(!value||typeof value!=='object'||Array.isArray(value))return false;const row=value as Learner;return row.introVersion===1&&(row.age===null||Number.isInteger(row.age)&&row.age>=1&&row.age<=120)&&['male','female','nonbinary','unspecified'].includes(row.gender)&&validAvatar(row.avatar)&&typeof row.coachTips==='boolean'&&typeof row.plainLanguage==='boolean';}
export const avatarColor=(part:'skin'|'hairColor'|'shirt'|'background',id:string)=>avatarOptions[part].find(option=>option[0]===id)?.[2]??avatarOptions[part][0][2];
export const genderLabels=[['unspecified','არ მსურს მითითება'],['female','ქალი'],['male','კაცი'],['nonbinary','არაბინარული']] as const;

export function needsIntroduction(p:Progress,route:string){return route==='onboarding'||(!p.profile.onboarded&&!p.completed.length&&!p.studio?.completed.length&&['home','path'].includes(route));}
