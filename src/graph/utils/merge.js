// The `merge` function provides simple property merging.
export default function merge (src, dest, overwrite) {
  // Do nothing if neither are true objects.
  if (Array.isArray(src) || Array.isArray(dest) || typeof src !== 'object' || typeof dest !== 'object')
    return dest;

  // Default overwriting of existing properties to false.
  overwrite = overwrite || false;

  for (var key in src) {
    // Only copy properties, not functions.
    if (typeof src[key] !== 'function' && (!dest[key] || overwrite))
      dest[key] = src[key];
  }

  return dest;
};
