// Shared API taxonomy for registration, profiles, discovery and state pages.
// "Other" remains possible for traditions not represented in this non-exhaustive list.
export const STATE_RECORDS = [
['Andhra Pradesh','South','Kuchipudi|Burrakatha'],['Arunachal Pradesh','Northeast','Aji Lhamu'],
['Assam','Northeast','Bihu|Sattriya'],['Bihar','East','Madhubani|Jat-Jatin'],
['Chhattisgarh','Central','Panthi|Raut Nacha'],['Goa','West','Fugdi|Dhalo'],
['Gujarat','West','Garba|Dandiya'],['Haryana','North','Saang'],
['Himachal Pradesh','North','Nati'],['Jharkhand','East','Chhau|Paika'],
['Karnataka','South','Yakshagana|Dollu Kunitha'],['Kerala','South','Kathakali|Mohiniyattam'],
['Madhya Pradesh','Central','Matki|Rai'],['Maharashtra','West','Lavani|Powada'],
['Manipur','Northeast','Manipuri|Pung Cholom'],['Meghalaya','Northeast','Shad Suk Mynsiem'],
['Mizoram','Northeast','Cheraw'],['Nagaland','Northeast','Naga Folk Dance'],
['Odisha','East','Odissi|Pattachitra'],['Punjab','North','Bhangra|Giddha'],
['Rajasthan','West','Ghoomar|Kalbelia'],['Sikkim','Northeast','Maruni'],
['Tamil Nadu','South','Bharatanatyam|Karagattam'],['Telangana','South','Perini|Oggu Katha'],
['Tripura','Northeast','Hojagiri'],['Uttar Pradesh','North','Kathak|Nautanki'],
['Uttarakhand','North','Chholiya'],['West Bengal','East','Baul|Chhau'],
['Andaman and Nicobar Islands','Islands','Nicobari Folk Dance'],
['Chandigarh','North','Bhangra'],['Dadra and Nagar Haveli and Daman and Diu','West','Tarpa Dance'],
['Delhi','North','Kathak'],['Jammu and Kashmir','North','Rouf'],
['Ladakh','North','Cham'],['Lakshadweep','Islands','Lava Dance'],
['Puducherry','South','Garadi']
];

export const ART_FORM_GROUPS = {
  'Classical Dance': ['Bharatanatyam','Kathak','Kathakali','Kuchipudi','Odissi','Manipuri','Mohiniyattam','Sattriya'],
  'Folk Dance': ['Bihu','Garba','Dandiya','Ghoomar','Kalbelia','Lavani','Nati','Bhangra','Giddha','Chhau','Dollu Kunitha','Cheraw','Hojagiri','Karagattam','Kummi','Kolattam','Panthi','Raut Nacha','Matki','Rai','Dhalo','Fugdi','Pung Cholom','Shad Suk Mynsiem','Naga Folk Dance','Tarpa Dance','Nicobari Folk Dance','Perini','Jat-Jatin','Paika','Maruni','Chholiya','Rouf','Garadi','Koli Dance','Bamboo Dance'],
  'Folk Music': ['Baul','Baul Music','Bihu Music','Rajasthani Folk','Sufi Music','Qawwali','Powada','Oggu Katha','Bhatiali','Borgeet','Ghazal','Carnatic Music','Hindustani Classical','Rabindra Sangeet','Pandavani','Folk Singing','Devotional Music','Lavani Singing'],
  'Instrumentalists': ['Tabla','Sitar','Flute','Dhol','Dholak','Sarangi','Veena','Mridangam','Shehnai','Santoor','Nadaswaram','Pakhawaj','Harmonium','Folk Instrument Ensemble'],
  'Theatre & Puppetry': ['Kathputli','Yakshagana','Burrakatha','Nautanki','Jatra','Tamasha','Therukoothu','Togalu Gombeyaata','Aji Lhamu','Saang','Puppetry','Storytelling','Street Theatre','Traditional Theatre','Koodiyattam','Cham','Chitrakathi'],
  'Traditional Arts': ['Madhubani','Pattachitra','Warli','Gond Art','Kalamkari','Phad Painting','Pithora Painting','Pichwai Painting','Pottery','Handloom Weaving','Rangoli','Folk Painting','Traditional Crafts','Kalaripayattu','Block Printing','Terracotta','Meenakari','Traditional Painting']
};

export const ART_CATEGORIES = Object.keys(ART_FORM_GROUPS);
export const ART_FORMS = [...new Set([...ART_CATEGORIES,...Object.values(ART_FORM_GROUPS).flat()])]
  .sort((a,b)=>a.localeCompare(b));
export const STATE_NAMES = STATE_RECORDS.map(x=>x[0]).sort((a,b)=>a.localeCompare(b));

export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-IN');
}
const knownStates = new Map(STATE_NAMES.map(name=>[normalizeText(name),name]));
const locationAliases = {
  'vizag':'Andhra Pradesh','visakhapatnam':'Andhra Pradesh','anakapalle':'Andhra Pradesh',
  'kharagpur':'West Bengal','kgp':'West Bengal','kolkata':'West Bengal','calcutta':'West Bengal',
  'hyderabad':'Telangana','secunderabad':'Telangana','bengaluru':'Karnataka','bangalore':'Karnataka',
  'chennai':'Tamil Nadu','madras':'Tamil Nadu','mumbai':'Maharashtra','bombay':'Maharashtra',
  'pune':'Maharashtra','jaipur':'Rajasthan','bhubaneswar':'Odisha','bbsr':'Odisha',
  'new delhi':'Delhi','srinagar':'Jammu and Kashmir',
  'orissa':'Odisha','uttaranchal':'Uttarakhand','pondicherry':'Puducherry',
  'jammu & kashmir':'Jammu and Kashmir','andaman & nicobar islands':'Andaman and Nicobar Islands'
};
export function normalizeState(value) {
  const s=normalizeText(value);
  return knownStates.get(s) || locationAliases[s] || String(value ?? '').trim().replace(/\s+/g,' ');
}

const categoryByForm = new Map(
  Object.entries(ART_FORM_GROUPS).flatMap(([category,forms])=>[[normalizeText(category),category],...forms.map(form=>[normalizeText(form),category])])
);
const artAliases = {
 'baul singing':'Folk Music','folk song':'Folk Music','folk songs':'Folk Music',
 'classical music':'Folk Music','folk instruments':'Instrumentalists',
 'folk theater':'Theatre & Puppetry','folk theatre':'Theatre & Puppetry',
 'folk art':'Traditional Arts','handicrafts':'Traditional Arts',
 'dance':'Folk Dance','music':'Folk Music','painting':'Traditional Arts',
 'indian classical dance':'Classical Dance'
};
export function categoryForArt(form) {
  const normalized=normalizeText(form);
  return categoryByForm.get(normalized) || artAliases[normalized] || 'Other';
}
export function artMatches(form,search) {
  const desired=normalizeText(search);
  const candidate=normalizeText(form);
  if(!desired||desired==='all art forms')return true;
  if(desired==='other')return categoryForArt(form)==='Other';
  if(ART_CATEGORIES.some(x=>normalizeText(x)===desired)) return normalizeText(categoryForArt(form))===desired || candidate.includes(desired);
  return candidate===desired || candidate.includes(desired);
}
export function isValidCustomValue(value) {
  return typeof value==='string' && value.trim().length>=2 && value.trim().length<=100 &&
    !['other','all states','all art forms'].includes(normalizeText(value));
}
