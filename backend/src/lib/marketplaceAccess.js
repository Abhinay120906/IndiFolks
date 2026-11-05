// A marketplace artist is also a valid event host; self-booking is never allowed.
export function canActAsBuyer(user) {
  return Boolean(user && (user.role === 'customer' || user.role === 'artist'));
}

export function canBookArtist(user, artistId) {
  return canActAsBuyer(user) && Boolean(artistId) &&
    String(user._id) !== String(artistId);
}
