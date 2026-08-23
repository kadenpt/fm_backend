const SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export function validPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (/\s/.test(password)) return false;

  // only alphanumeric + allowed specials
  if (!/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(password)) {
    return false;
  }

  // at least one special
  if (!SPECIAL.test(password)) return false;

  return true;
}