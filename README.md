# SOSA v18
1. Supabase: run supabase/schema.sql in the SQL editor (creates tables, stock function, public `products` bucket).
2. Copy .env.example → .env.local and fill it (also add the same vars in Vercel / SoloHost).
3. npm install → npm run dev → localhost:3000. Hidden admin: tap the logo 5 times. Admin > products > "Seed catalog" writes the starter items (and prices) to the DB; replace images by upload.
4. Pi: public/validation-key.txt must contain ONLY your Pi validation key (served at /validation-key.txt). Keep the old sosa-outfits project and its key untouched.
5. SoloHost: docker build -t sosa-v18 . && docker run -p 3000:3000 --env-file .env.local sosa-v18
