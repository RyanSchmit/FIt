# Lift & Bulk Tracker

A local, client-side dashboard with two tabs: a **Strength** analyzer that mines your
[Strong](https://www.strong.app/) CSV export, and a **Nutrition** tracker that helps you eat
enough to keep gaining weight and lifting more.

## Strength tab

For a selected exercise it tracks your estimated 1RM over time and correlates each session's
improvement against the training you did in the lead-up window:

- **Frequency** - sessions per week of that lift
- **Volume** - total weight x reps
- **Working sets** - number of sets
- **Intensity** - top-set weight as a percent of your estimated max
- **Recovery** - days of rest since the previous session

It ranks the factors by how strongly they correlate with your next-session improvement,
plots each as a scatter with a trend line, and writes plain-English takeaways.

## Nutrition tab

Built for the "I can't eat enough to gain weight" problem. Log your food in
[MyFitnessPal](https://www.myfitnesspal.com/) and transfer the daily totals here:

- **Daily targets** - a suggested calorie/protein goal derived from your latest body weight
  (maintenance is estimated as `bodyweight x 15`, the bulking target adds a ~400 kcal surplus
  for roughly +0.4 lb/week, and protein defaults to ~1 g/lb). Fully editable.
- **Today** - calorie and protein progress bars showing how much you have left to eat.
- **Today's intake** - one place to enter the day's total calories and protein from MyFitnessPal;
  re-saving overwrites the day.
- **Intake vs results** - once you have a few weeks of data, it correlates your weekly average
  daily calories against weekly body-weight change (and weekly strength change) with a scatter,
  trend line, Pearson r, and a plain-English takeaway.

Your daily intake and targets are saved in your browser via `localStorage`
(`bulk-tracker:v1`); nothing is sent anywhere.

### Method

- Sets are grouped into one session per workout day.
- Performance per session = best **estimated 1RM** via the Epley formula
  `weight x (1 + reps / 30)`. Bodyweight movements fall back to reps.
- Improvement = change in e1RM (or top weight) versus the previous session.
- Each factor's relationship is measured with a Pearson correlation and a linear regression.

These are correlations from your own history, not proof of cause and effect.

## Run

```bash
cd app
npm install
npm run dev
```

Open the printed `localhost` URL. The bundled `strong_workouts.csv` loads automatically.
Drag and drop any future Strong export (same columns) onto the upload area to analyze it.

Quick-picks default to Squat (Barbell) and Bench Press (Barbell); use the dropdown for any
of the other exercises in your file. Tune the lead-up window (7/14/21/28 days) and the
improvement metric (estimated 1RM vs top weight) from the controls.

## Stack

Vite + React + TypeScript, Recharts for charts, PapaParse for CSV, Tailwind CSS. No backend;
everything runs in your browser and your data never leaves your machine.
# FIt
