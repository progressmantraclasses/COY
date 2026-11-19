import { Profile, PublicProfile } from './profile.types';

/**
 * Explicit allow-list mapper. We copy named fields rather than spreading and
 * deleting, so a new internal field added to `Profile` later can never leak by
 * accident. This is what upholds Coy's promise: nobody learns who liked them
 * unless it is mutual.
 */
export function toPublicProfile(p: Profile): PublicProfile {
  const out: PublicProfile = {
    id: p.id,
    name: p.name,
    age: p.age,
    photo: p.photo,
    bio: p.bio,
    city: p.city,
    interests: [...p.interests],
  };
  if (p.college) out.college = p.college;
  return out;
}
