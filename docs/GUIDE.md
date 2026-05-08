# NutriFit AI — User Guide

## What Is NutriFit AI?

NutriFit AI is an AI-powered nutrition and training coach. You tell it what you ate and how you trained today, either by voice or by typing, and it returns:

- A complete **nutrition analysis** of the foods you consumed: calories, protein, carbohydrates, and fat.
- A **training analysis** with calories burned and workout volume.
- **Visual charts** for macro distribution and calorie balance.
- **Personalized recommendations** from a sports nutrition perspective.

You do not need to manually search for every food in a database or calculate workout metrics yourself. Just describe your day naturally.

---

## Screen-by-Screen Guide

### Home Screen

`[screenshot: dark home screen with the "NutriFit AI" title, "Fit" highlighted in lime green, a large circular green microphone button in the center, and a text input area underneath]`

This is the main screen. You will see:

- The **NutriFit AI** title at the top.
- A large green **microphone button** in the center.
- A **text area** where your transcript appears, and where you can also type manually.
- **Clear** and **Analyze my day** action buttons.

#### How to Use It

1. Click the **microphone button**. It turns red while the app is listening.
2. Speak naturally, as if you were telling a coach what you ate and how you trained. Example:
   > "For breakfast I had avocado toast and two eggs. For lunch, grilled chicken breast with rice. For training I did back: pull-ups, 4 sets of 8, and barbell row, 4 sets of 10 at 60 kilos."
3. Click the microphone again to stop recording.
4. Review the transcript in the text area. You can edit anything that was transcribed incorrectly.
5. Click **Analyze my day** and wait while the agents process the information.

You will see a five-step progress indicator showing exactly what the system is doing.

#### Profile Button

The top-right **Profile** button opens a form where you can enter body and goal data such as weight, height, age, activity level, and fitness goal. This makes calorie and protein calculations more personalized.

---

### Results Dashboard

`[screenshot: dark dashboard with three cards in the top row showing a macro pie chart, calorie balance bar, and quality gauge; below that, nutrition and training tables; at the bottom, colored expert advice cards]`

This screen shows the full analysis of your day.

#### Visual Summary

- **Macro Distribution**: A pie chart showing how your macronutrients are split between protein, carbohydrates, and fat.
- **Calorie Balance**: Bars comparing calories eaten against calories burned during training. It also shows the net balance.
- **Nutrition Quality**: A 0-to-100 score evaluating the overall quality of the day's nutrition.

#### Food Table

`[screenshot: table with columns for Food, Serving, Calories, Protein, Carbs, and Fat, including a highlighted total row]`

This table shows each food or meal with its estimated nutrition values. If a dish is a recipe, such as rice with chicken, the table can show individual ingredients under the meal name. The final row shows the total for the day.

#### Training Table

`[screenshot: table with columns for Exercise, Type, Duration, Volume, Intensity, and Calories]`

This table shows each exercise with estimated calories burned, workout volume for strength movements, duration, and intensity. The final row shows total training calories burned.

#### Expert Advice

The expert section is split into three color-coded cards:

- **Green - What you are doing well**: Positive habits backed by the day's data.
- **Yellow - What you can improve**: Areas with room for improvement and why they matter.
- **Blue - Recommendations**: Specific actions for the next day.

You will also see:

- An **overall score**, such as A, B+, or C.
- A **priority action** banner with the most important thing to do tomorrow.
- A short **motivational note** based on the analysis.

---

### Profile Screen

`[screenshot: modal with dark translucent background, form fields for weight, height, age, sex, activity level, and goal, plus Cancel and Save buttons]`

Fill in your profile to improve the accuracy of calculations:

- **Weight (kg)**: Your current body weight.
- **Height (cm)**: Your height.
- **Age**: Your age in years.
- **Sex**: Male or female.
- **Activity level**: Sedentary, light, moderate, active, or very active.
- **Goal**: Body recomposition, muscle gain, or fat loss.

The profile is saved in your browser's `localStorage`, so you do not need to enter it every time.

---

## Usage Examples

### Example 1 — Strength Day

> "I ate a Spanish omelette and a coffee with milk. For training: squats 5x5 at 100kg, leg press 4x12 at 180kg, and leg extensions 3x15 at 40kg."

**Expected result:**

- Around 1200 kcal eaten.
- High lower-body workout volume.
- Recommendation to increase protein after training and add more food if the calorie deficit is too aggressive.

### Example 2 — Cardio and Light Diet Day

> "Breakfast: Greek yogurt with berries. Lunch: tuna salad with tomato and corn. Dinner: vegetable soup. Training: 45 minutes running at 8 km/h."

**Expected result:**

- Around 1100 kcal eaten.
- Around 400 kcal burned.
- Aggressive calorie deficit detected.
- Recommendation to increase calories and protein to better preserve muscle.

### Example 3 — High-Calorie Day

> "I ate a double burger with fries and a soda. For dinner, margherita pizza. I did not train."

**Expected result:**

- Around 2800 kcal eaten.
- 0 kcal burned through training.
- Lower score, such as C or D.
- Advice to return to the normal routine instead of overcompensating the next day.
- Recommendation to do a strength session the next day.

---

## Frequently Asked Questions

**Does it work on mobile?**

Yes. The microphone works best in Chrome for Android. On iOS, Web Speech API support is limited, so use the text area as a fallback.

**Can I type instead of speaking?**

Yes. The text area under the microphone lets you type directly. Voice input is optional.

**Is my data saved?**

Your profile data, such as weight and height, is saved in your browser's `localStorage`. Analysis results are not saved between sessions. If you reload or close the app, the current result is lost.

**What should I do if speech recognition is inaccurate?**

- Speak clearly in a low-noise environment.
- Use simple, direct sentences.
- Edit the transcript before clicking Analyze.
- Try Chrome on desktop for better recognition.

**How long does the analysis take?**

Usually 30 to 60 seconds. The agents use live web search for nutrition and training estimates, so timing depends on the model and network response.

**Are the nutrition values exact?**

No. They are reasonable estimates based on sources such as USDA, BEDCA, MyFitnessPal, or similar nutrition references. They are not a medical diagnosis and do not replace advice from a qualified professional.

**Which browsers are supported?**

- **Chrome**: recommended, best support for voice input.
- **Edge**: good support.
- **Firefox**: app works, but voice recognition support may be missing.
- **Safari**: limited functionality, especially for voice input.
