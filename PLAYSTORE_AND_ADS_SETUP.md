# Arrow Escape - Mobile Se Play Store Par Launch Aur AdMob Ads Lagane Ka Complete Guide

Yeh guide un sabhi developers ke liye hai jo **apne mobile phone se** bina kisi laptop ya PC ke game ko Google Play Store par launch karna aur Google AdMob se kamai (monetize) karna chahte hain.

---

## Part 1: Bina PC Ke APK Aur AAB File Kaise Milegi? (GitHub Actions Cloud)

Aapko apne phone me koi heavy software (jaise Android Studio) install karne ki zaroorat nahi hai. Humne aapke repository me **Capacitor + GitHub Actions Cloud Build** configure kar diya hai.

### APK Aur AAB Download Karne Ka Tarika:
1. Apne mobile ke Chrome browser me apna GitHub repository kholein:
   `https://github.com/vishvajeet9717kumar-cell/arrow-escape`
2. Upar menu me **Actions** tab par click karein.
3. Waha sabse upar **"Build Android APK and Play Store Bundle"** run dikhega (Green checkmark aane par click karein).
4. Page ke bottom me **Artifacts** section me aapko 2 files milengi:
   - **`ArrowEscape-Debug-APK`**: Is zip ko extract karke direct apne Android mobile me install karein aur test karein!
   - **`ArrowEscape-PlayStore-AAB`**: Yeh `.aab` file hai jo direct Google Play Console par upload hoti hai!

---

## Part 2: Google AdMob Se Real Ads Kaise Lagayein?

Arrow Escape game ke andar pehle se hi Ads ka pura code ready hai:
- Bottom **Banner Ad** (non-intrusive)
- Level clear hone par **Interstitial Ad** (every 4 levels)
- **Rewarded Video Ads** (+50 Coins, Free Hint, 2x Victory Coins, Second Chance)

### AdMob Account Setup (Mobile Browser Se):
1. Mobile Chrome me `https://admob.google.com` kholein aur apne Google/Gmail account se Sign In karein.
2. Left menu me **Apps** -> **Add App** par tap karein.
3. Platform select karein: **Android**.
4. "Is the app listed on a supported app store?": Abhi **No** chunein (jab Play Store par aa jayega tab Yes karke link kar sakte hain).
5. App Name likhein: **Arrow Escape** -> **Add App** dabayein.
6. Aapko aapki **AdMob App ID** mil jayegi (format: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`).

### 3 Ad Units Banayein:
1. **Banner Ad**:
   - "Add Ad Unit" -> **Banner** chunein -> Name: `Arrow_Banner` -> Create Ad Unit.
2. **Interstitial Ad**:
   - "Add Ad Unit" -> **Interstitial** chunein -> Name: `Arrow_Interstitial` -> Create Ad Unit.
3. **Rewarded Ad**:
   - "Add Ad Unit" -> **Rewarded** chunein -> Name: `Arrow_Rewarded` -> Create Ad Unit.

> **Note**: Har Ad Unit ki apni ek ID hoti hai (jaise: `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`). In IDs ko copy karke rakh lein.

---

## Part 3: Google Play Store Par Launch Kaise Karein? (Step-by-Step)

### Step 1: Google Play Console Account
1. Mobile browser me `https://play.google.com/console/signup` par jayein.
2. Google Play Developer Account ke liye **$25 (one-time)** registration fee hoti hai jo Google lifetime account ke liye charge karta hai.
3. Apni identity verify karein.

### Step 2: Create App
1. Play Console dashboard par **"Create app"** button par tap karein.
2. **App details**:
   - App name: `Arrow Escape - 3D Puzzle Game`
   - Default language: `English (United States)`
   - App or game: `Game`
   - Free or paid: `Free`
3. Declarations accept karein aur **Create app** dabayein.

### Step 3: Store Listing Assets (Zaroori Cheezein)
Play Store par dikhane ke liye aapko yeh 4 cheezein chahiye (Aap Canva app se mobile par hi 5 minute me bana sakte hain):
1. **App Icon**: 512 x 512 pixels (PNG format, transparent background na ho).
2. **Feature Graphic**: 1024 x 500 pixels (Game ka attractive banner).
3. **Screenshots**: Kam se kam 3-4 screenshots (Phone me game open karke screenshots le lein).
4. **Short Description**: (e.g., "Relaxing yet challenging minimalist 2D and 3D arrow puzzle game with 500 levels!")
5. **Full Description**: Game ke features, 500 levels, 3D cube mode aur special arrows ka description.

### Step 4: Policy & Content Rating
Play Console ke left menu me **Policy** -> **App content** me jayein:
- **Privacy Policy**: Ek simple free privacy policy URL dalein (e.g., https://www.privacypolicies.com se 2 minute me ban jati hai).
- **Ads**: "Yes, my app contains ads" select karein.
- **Content Rating**: Questionnaire complete karein (Casual game - violence nahi hai, PEGI 3 / Everyone rating milegi).
- **Target Audience**: 13+ or All ages.

### Step 5: Upload AAB (Release)
1. Left menu me **Production** (ya **Closed testing**) par jayein.
2. **Create new release** par tap karein.
3. GitHub Actions se download ki hui **`app-release.aab`** file ko upload karein.
4. Release name likhein (e.g., `1.0.0 (Initial Release)`).
5. **Next** -> **Save** -> **Review and roll out to production** par click karein!

🎉 **Mubarak ho!** Google ki team 2 se 4 din ke andar app review karke Play Store par live kar degi!
Live hone ke baad aap AdMob me jakar app ko Play Store se link kar dena, jisse real ads aane lagenge aur aapki earning shuru ho jayegi.
