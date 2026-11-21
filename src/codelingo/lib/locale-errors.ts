/** Localized explanations retain technical identifiers without translating code. */
export function georgianError(message:string):string{
 if(/[ა-ჰ]/.test(message))return message;
 const known:Record<string,string>={
  'Invalid login credentials':'ელფოსტა ან პაროლი არასწორია.',
  'Email not confirmed':'ელფოსტის მისამართი ჯერ დადასტურებული არ არის.',
  'User already registered':'ამ მისამართით ანგარიში უკვე არსებობს.',
  'Failed to fetch':'სერვისთან დაკავშირება ვერ მოხერხდა. გადაამოწმე კავშირი და პროექტის მისამართი.',
  'Invalid API key':'პროექტის საჯარო გასაღები არასწორია.',
  'Email rate limit exceeded':'ელფოსტის მოთხოვნების დროებითი ზღვარი ამოიწურა. მოგვიანებით სცადე.',
 };
 if(known[message])return known[message];
 const undefinedName=message.match(/^(?:Uncaught )?(?:ReferenceError: )?([\w$]+) is not defined$/);
 if(undefinedName)return `${undefinedName[1]} განსაზღვრული არ არის. გადაამოწმე სახელი და გამოცხადების ადგილი.`;
 if(message.includes('Unexpected token'))return message.replace('Unexpected token','მოულოდნელი სიმბოლო');
 if(message.includes('Unterminated string constant'))return message.replace('Unterminated string constant','სტრიქონს დამხურავი ბრჭყალი აკლია');
 if(message.includes('Maximum call stack size exceeded'))return 'ფუნქციამ საკუთარ თავს მეტისმეტად ბევრჯერ მიმართა. გადაამოწმე დასრულების პირობა.';
 if(message.includes('Cannot read properties of null')||message.includes('Cannot read properties of undefined'))return 'თვისების წაკითხვა ვერ მოხერხდა: ელემენტი ან მნიშვნელობა არ არსებობს. გადაამოწმე სელექტორი და არსებობის პირობა.';
 return 'ტექნიკური დეტალი: '+message;
}
