// Artist profile completeness is calculated from saved profile fields, not UI defaults.
// Keep labels in sync with the editable profile fields in the artist dashboard.
export function profileCompleteness(user = {}) {
  const hasText = v => typeof v === 'string' && v.trim().length > 0;
  const requirements = [
    ['stage name', hasText(user.name)],
    ['specialty', hasText(user.specialty) || hasText(user.artForm)],
    ['state', hasText(user.state)],
    ['bio', hasText(user.bio)],
    ['experience', hasText(user.experience)],
    ['performance price', Number(user.price) > 0],
    ['artistic story', hasText(user.story)],
    ['profile photo', hasText(user.profileImage)],
    ['performance gallery', Array.isArray(user.gallery) && user.gallery.some(image => hasText(image?.url))]
  ];
  const complete = requirements.filter(([, met]) => met).length;
  return {
    score: Math.round(100 * complete / requirements.length),
    completed: complete,
    total: requirements.length,
    missing: requirements.filter(([, met]) => !met).map(([label]) => label)
  };
}
