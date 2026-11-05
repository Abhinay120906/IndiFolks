// Illustrative images reuse the website's existing cultural-category photography.
// Never misrepresent a stock photograph as the individual artist's portrait.
export const ART_ILLUSTRATIONS:Record<string,string> = {
  "Classical Dance":"https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80",
  "Folk Dance":"https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
  "Folk Music":"https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  "Instrumentalists":"https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
  "Theatre & Puppetry":"https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
  "Traditional Arts":"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=80"
};
export const artIllustration=(category:string)=>ART_ILLUSTRATIONS[category]||ART_ILLUSTRATIONS["Traditional Arts"];
