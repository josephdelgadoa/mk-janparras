
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    if (keyMatch) supabaseKey = keyMatch[1].trim();
} catch (e) {
    console.error("Could not read .env");
}

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #db2777; padding: 30px; text-align: center; color: white; }
  .content { padding: 40px; color: #374151; line-height: 1.6; }
  .button { display: inline-block; background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
  .section-title { font-size: 18px; font-weight: bold; color: #db2777; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .list-item { margin-bottom: 8px; padding-left: 20px; position: relative; }
  .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>2026 Beach Wedding & Vow Renewals</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you so much for reaching out, and congratulations on your upcoming vow renewal! 🌸</p>
      <p>I would love to help you create a simple, heartfelt beach ceremony during your stop in Puerto Vallarta. I offer beautiful Wedding Ceremony and Vow Renewal Packages on the beach, perfect for intimate celebrations, with the sound of the ocean and a stunning sunset as your backdrop.</p>
      
      <p>Please see the two package options below. Everything can also be customized to fit your preferences.</p>
      
      <p>I would be happy to schedule a quick call to review details and confirm timing with your cruise stop:</p>
      <p>👉 <a href="[Insert your Calendly link]">Book a time here</a></p>
      
      <p>Warm regards,<br>
      <strong>Robin Manoogian</strong><br>
      Vallarta Vows – Puerto Vallarta, Mexico<br>
      🌐 <a href="http://www.vallartavows.com">www.vallartavows.com</a><br>
      💌 vallartavows@gmail.com</p>

      <div class="section-title">🌴 Beach Wedding & Vow Renewal Packages – Conchas Chinas Beach</div>
      <p>I am happy to help you plan your ceremony and create a beautiful experience here in Puerto Vallarta.</p>

      <div class="section-title">💍 Package 1 – All Inclusive | $2,000 USD</div>
      <p><em>(Discounted from $2,800 – special package rate)</em></p>
      <div>✅ Planning & coordination</div>
      <div>✅ Ceremony setup with officiant</div>
      <div>✅ Archway with fresh floral décor</div>
      <div>✅ Bouquet and boutonniere for the couple</div>
      <div>✅ Professional photography (including couple, family, and guest photos)</div>
      <div>✅ Walkway mats for the ceremony area</div>
      <div>✅ Speaker and microphone for music and vows</div>
      <div>✅ Small wedding cake</div>
      <div>✅ Chairs for up to 15 guests</div>
      <div>✅ Taxes included</div>

      <div class="section-title">🌸 Package 2 – Essential Ceremony $1,500 USD</div>
      <div>✅ Planning & coordination</div>
      <div>✅ Ceremony setup with officiant</div>
      <div>✅ Archway (with draping only)</div>
      <div>✅ Bouquet and boutonniere (color preference only)</div>
      <div>✅ Professional photography</div>
      <div>✅ Walkway mats</div>
      <div>✅ Taxes included</div>

      <div class="section-title">✨ Optional Enhancements (Add-Ons)</div>
      <p>You may add these to either package:</p>
      <div>✅ Professional Wedding Video – $650 USD (Ceremony + edited highlight video)</div>
      <div>✅ Live Trio Music for Ceremony – $250 USD (Romantic live music for processional and ceremony)</div>

      <div class="section-title">💳 Payment Options</div>
      <p>Venmo or Zelle<br>(+10% applies for credit card payments)</p>

      <div class="section-title">🍽️ Reception / Dinner Recommendation</div>
      <p>If you would like to celebrate after your ceremony, I highly recommend La Palapa Restaurant, located directly on the beach in Puerto Vallarta. It offers a beautiful, romantic setting that is perfect for wedding dinners and vow renewal celebrations. 🌴✨</p>
      <p>I am happy to assist with reservations and provide menu options in advance.</p>
      <p>📂 <a href="https://drive.google.com/drive/folders/1dRZeUxTiVTsOtjMgW2ld6stzVCnSnSKn?usp=sharing">Dinner menus and details</a></p>
      <p><em>Please note: These are group menus for parties of 30+ guests. Smaller groups may order from the regular restaurant menu.</em></p>
      
      <p>Warm regards,<br>
      Robin Manoogian<br>
      Vallarta Vows – Puerto Vallarta Wedding Planning<br>
      📞 USA: +1 (646) 216-8516<br>
      📞 Mexico / WhatsApp: +52 322-170-3027</p>
    </div>
    <div class="footer">
      &copy; 2026 Vallarta Vows. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

async function seed() {
    console.log("Seeding template...");
    const { data, error } = await supabase
        .from('email_templates')
        .insert({
            id: '2026-beach-wedding',
            title: '2026 Beach Wedding & Vow Renewals',
            description: 'Packages for intimate beach ceremonies and vow renewals.',
            image_url: 'http://www.vallartavows.com/wp-content/uploads/2026/01/welcome-letter-1.png',
            html_content: htmlContent,
            updated_at: new Date().toISOString()
        })
        .select();

    if (error) {
        console.error("Error inserting:", error);
    } else {
        console.log("Success:", data);
    }
}

seed();
