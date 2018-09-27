# Fix

- Fix case sensitive login.
- Allow inc/dec of items in basket.
- Ugly forms

## Known issues

This is my first node project, so there are things that are sub-optimal and that I would not be happy with if this were a real production app.

- User must be logged in to add items to the basket. Rubbish UX.

- I only just remembered about the `.populate()` function in Mongo. That would have made my life a bit easier but I'm not going back to change stuff now.

- Inconsistent naming schemes. Sometimes 'coffeeID' sometimes 'productID', sometimes 'quantity' other times 'qty'.