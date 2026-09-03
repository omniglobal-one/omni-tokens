/**
 * The OMNI Standard — resolved product accents (Level 2), as decided in
 * the finalized proposal plus the Step 1 shipped-material check:
 *   - Care, Share, Rewards, Sports: nudged for hue-separation only
 *     (confirmed safe — no shipped app icon, marketing site, social
 *     account, or app-store listing found for any of the eight).
 *   - Pay, Queue, Talent, Vendor: unchanged from their current stock value —
 *     no collision, no accessibility gap, no reason found to touch them.
 *
 * This is reference data, not secret config — every product repo's own
 * app just needs to call buildProductAccentTokens(PRODUCTS.care) once.
 */
module.exports = {
  care: '#0B7A3E',
  pay: '#1E40AF',
  queue: '#4D7C0F',
  rewards: '#9C6B0A',
  share: '#0C6B9E',
  sports: '#B8380A',
  talent: '#5B21B6',
  vendor: '#86198F',
};
